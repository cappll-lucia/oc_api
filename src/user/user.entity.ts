import { Entity, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import crypto from 'crypto';

@Entity()
export class User extends BaseEntity {
	@Property({ nullable: false })
	@Unique()
	email!: string;

	@Property({ nullable: false })
	password!: string;

	@Property({ nullable: false })
	firstName!: string;

	@Property({ nullable: false })
	lastName!: string;

	@Property({ nullable: false })
	role!: string;

	constructor(email: string, password: string, firstName: string, lastName: string, role: string) {
		super();
		this.email = email;
		this.password = hashPsw(password);
		this.firstName = firstName;
		this.lastName = lastName;
		this.role = role;
	}
}

export function hashPsw(psw: string) {
	return crypto.createHmac('sha256', psw).digest('hex');
}
