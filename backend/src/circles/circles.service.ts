import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Permission } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { InviteCaregiverDto } from './dto/invite-caregiver.dto';

/** Never select passwordHash (or the push token) into a payload that reaches the client. */
const PUBLIC_USER_SELECT = { id: true, email: true, name: true, role: true } as const;

@Injectable()
export class CirclesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyCircleAsPatient(patientId: string) {
    const circle = await this.prisma.circle.findUnique({
      where: { patientId },
      include: { members: { include: { caregiver: { select: PUBLIC_USER_SELECT } } } },
    });
    if (!circle) {
      throw new NotFoundException('No circle found for this patient account');
    }
    return circle;
  }

  async listCirclesForCaregiver(caregiverId: string) {
    const memberships = await this.prisma.circleMember.findMany({
      where: { caregiverId, status: 'ACCEPTED' },
      include: {
        circle: {
          include: {
            patient: { select: PUBLIC_USER_SELECT },
            members: { include: { caregiver: { select: PUBLIC_USER_SELECT } } },
          },
        },
      },
    });
    return memberships.map((m) => m.circle);
  }

  async listPendingInvites(caregiverId: string) {
    const memberships = await this.prisma.circleMember.findMany({
      where: { caregiverId, status: 'PENDING' },
      include: { circle: { include: { patient: { select: PUBLIC_USER_SELECT } } } },
    });
    return memberships.map((m) => ({
      circleId: m.circleId,
      permission: m.permission,
      patient: m.circle.patient,
    }));
  }

  async inviteCaregiver(userId: string, circleId: string, dto: InviteCaregiverDto) {
    const circle = await this.assertAdminAccess(userId, circleId);

    const caregiver = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!caregiver) {
      throw new NotFoundException('No account with that email exists yet. Ask them to register first.');
    }

    const existing = await this.prisma.circleMember.findUnique({
      where: { circleId_caregiverId: { circleId: circle.id, caregiverId: caregiver.id } },
    });
    if (existing) {
      throw new ConflictException('This caregiver is already invited to your circle');
    }

    return this.prisma.circleMember.create({
      data: {
        circleId: circle.id,
        caregiverId: caregiver.id,
        permission: dto.permission ?? Permission.VIEW_ONLY,
        invitedEmail: dto.email,
      },
    });
  }

  async acceptInvite(caregiverId: string, circleId: string) {
    const membership = await this.prisma.circleMember.findUnique({
      where: { circleId_caregiverId: { circleId, caregiverId } },
    });
    if (!membership) {
      throw new NotFoundException('No pending invite found');
    }
    return this.prisma.circleMember.update({
      where: { id: membership.id },
      data: { status: 'ACCEPTED' },
    });
  }

  /** Throws unless the user is the patient who owns this circle, or an accepted caregiver member. */
  async assertAccess(userId: string, circleId: string) {
    const circle = await this.prisma.circle.findUnique({ where: { id: circleId } });
    if (!circle) {
      throw new NotFoundException('Circle not found');
    }
    if (circle.patientId === userId) {
      return circle;
    }
    const membership = await this.prisma.circleMember.findUnique({
      where: { circleId_caregiverId: { circleId, caregiverId: userId } },
    });
    if (!membership || membership.status !== 'ACCEPTED') {
      throw new ForbiddenException('You do not have access to this circle');
    }
    return circle;
  }

  /** Throws unless the user is the patient, or an ADMIN caregiver member (used for geofence writes). */
  async assertAdminAccess(userId: string, circleId: string) {
    const circle = await this.assertAccess(userId, circleId);
    if (circle.patientId === userId) {
      return circle;
    }
    const membership = await this.prisma.circleMember.findUnique({
      where: { circleId_caregiverId: { circleId, caregiverId: userId } },
    });
    if (membership?.permission !== Permission.ADMIN) {
      throw new ForbiddenException('Only admin caregivers can perform this action');
    }
    return circle;
  }
}
