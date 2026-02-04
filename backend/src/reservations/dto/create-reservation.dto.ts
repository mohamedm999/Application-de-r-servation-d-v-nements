import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({
    description: 'ID of the event to reserve',
    example: 'event-id-123',
  })
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({
    description: 'Number of seats to reserve',
    example: 2,
    minimum: 1,
    default: 1,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  numberOfSeats?: number = 1;
}
