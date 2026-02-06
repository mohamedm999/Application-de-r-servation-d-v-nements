import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ReservationStatus } from '../../common/enums/reservation-status.enum';

export class UpdateReservationStatusDto {
  @ApiProperty({
    description: 'New status for the reservation',
    enum: ReservationStatus,
    example: ReservationStatus.CONFIRMED,
  })
  @IsEnum(ReservationStatus)
  status!: ReservationStatus;
}
