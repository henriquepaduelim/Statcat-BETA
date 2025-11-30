export enum Role {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  COACH = 'COACH',
  ATHLETE = 'ATHLETE',
}

export const RolesPriority: Role[] = [
  Role.ADMIN,
  Role.STAFF,
  Role.COACH,
  Role.ATHLETE,
];
