import { Injectable } from '@nestjs/common';
import { Student } from './student.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
  ) {}

    async create(name: string, BirthDate: Date): Promise<Student> {
        const student = this.studentRepository.create({ name, BirthDate });
        return this.studentRepository.save(student);
    }

    async findAll(): Promise<Student[]> {
        return this.studentRepository.find();
    }
}