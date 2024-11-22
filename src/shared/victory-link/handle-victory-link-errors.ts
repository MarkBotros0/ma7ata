import { BadRequestException } from '@nestjs/common';

type error = { code: number; message: string };

const errorMessages: error[] = [
  { code: -1, message: 'Invalid Credentials' },
  { code: -2, message: 'Invalid Account IP' },
  { code: -3, message: 'Invalid ANI Black List' },
  { code: -5, message: 'Out Of Credit' },
  { code: -6, message: 'Database Down' },
  { code: -7, message: 'Inactive Account' },
  { code: -8, message: 'No DLR received' },
  { code: -11, message: 'Account Is Expired' },
  { code: -12, message: 'SMS Is Empty' },
  { code: -13, message: 'Invalid Sender With Connection' },
  { code: -14, message: 'SMS Sending Failed Try Again' },
  { code: -100, message: 'Other Error' },
  { code: -16, message: 'User Can Not Send With DLR' },
  { code: -18, message: 'Invalid ANI' },
  { code: -19, message: 'SMS Id Is Exist' },
  { code: -21, message: 'Invalid Account' },
  { code: -22, message: 'SMSNotValidate' },
  { code: -23, message: 'Invalid Account Operator Connection' },
  { code: -26, message: 'Invalid User SMS Id' },
  { code: -29, message: 'Empty User Name Or Password' },
  { code: -30, message: 'Invalid Sender' },
  { code: -31, message: 'InvalidStartTime' },
  { code: -32, message: 'InvalidSMSTemplateOrItems' }
];

export function handleVictoryLinkErrors(errorCode: number): void {
  const error = errorMessages.find((err: error) => err.code === errorCode);

  if (error) {
    throw new BadRequestException('Error sending SMS: ' + error.message);
  } else {
    throw new BadRequestException('Error sending SMS: Unexpected Error');
  }
}
