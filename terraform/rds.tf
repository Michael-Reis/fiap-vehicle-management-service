# RDS MySQL para a aplicação
resource "aws_db_subnet_group" "main" {
  name       = "fiap-vehicle-management-db-subnet-group"
  subnet_ids = aws_subnet.public[*].id

  tags = {
    Name = "fiap-vehicle-management-db-subnet-group"
  }
}

resource "aws_security_group" "rds" {
  name_prefix = "fiap-vehicle-management-rds-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "fiap-vehicle-management-rds-sg"
  }
}

resource "aws_db_instance" "main" {
  identifier     = "fiap-vehicle-management-db"
  engine         = "mysql"
  engine_version = "8.0"
  instance_class = "db.t3.micro"
  
  allocated_storage     = 20
  max_allocated_storage = 30
  storage_type         = "gp2"
  
  db_name  = "vehicledb"
  username = "admin"
  password = "fiap123456"
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 1
  backup_window          = "07:00-09:00"
  maintenance_window     = "sun:09:00-sun:11:00"
  
  skip_final_snapshot = true
  deletion_protection = false
  
  publicly_accessible = false
  
  tags = {
    Name = "fiap-vehicle-management-db"
  }
}
