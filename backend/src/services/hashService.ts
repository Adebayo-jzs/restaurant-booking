import bcrypt from 'bcryptjs';

export const hashPassword = (plainPassword:string) => {
    return bcrypt.hash(plainPassword,10);
}

export const comparePassword = (plainPassword:string,hashedPassword:string) => {
    return bcrypt.compare(plainPassword,hashedPassword);
}

