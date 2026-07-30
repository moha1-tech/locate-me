import { IsInt, IsNumber, IsString, Max, Min, MinLength } from 'class-validator';

export class UpsertGeofenceDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  centerLat!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  centerLng!: number;

  @IsInt()
  @Min(10)
  radiusMeters!: number;
}
