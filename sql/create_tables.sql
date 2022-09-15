CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

SELECT uuid_generate_v4();

--- Creation of clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid DEFAULT uuid_generate_v4(),
  name varchar(200) NOT NULL,
  contact varchar(200) NOT NULL,
  PRIMARY KEY (id)
);

--- Creation of projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid DEFAULT uuid_generate_v4(),
  project_name varchar(200) NOT NULL,
  client_id uuid NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_client
      FOREIGN KEY(client_id) 
	  REFERENCES clients(id)
);