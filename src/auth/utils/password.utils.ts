/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import * as argon from 'argon2';

export const hashPassword = async (password: string): Promise<string> =>
  await argon.hash(password);

export const verifyPassword = async (
  hashedPassword: string,
  plainPassword: string,
): Promise<boolean> => await argon.verify(hashedPassword, plainPassword);
