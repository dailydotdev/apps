export interface Company {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  image: string;
}

export interface UserCompany {
  createdAt: Date;
  updatedAt: Date;
  company?: Company;
  email: string;
}
