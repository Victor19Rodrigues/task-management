import { Test } from '@nestjs/testing'
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';

const mockUser = { id: 12, username: 'Victor' };

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
})

describe('TasksService', () => {
  let tasksService;
  let taskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository }
      ]
    }).compile();

    tasksService = await module.get<TasksService>(TasksService);
    taskRepository = await module.get<TaskRepository>(TaskRepository);
  });

  describe('getTasks', () => {
    it('gets all tasks from repository', async () => {
      // returns of function
      taskRepository.getTasks.mockResolvedValue('someValue');

      expect(taskRepository.getTasks).not.toHaveBeenCalled();

      const filters: GetTasksFilterDto = {status: TaskStatus.IN_PROGRESS, search: 'Some search query'};
      const result = await tasksService.getTasks(filters, mockUser)

      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('someValue');
    })
  });

  describe('getTaskById', () => {
    it('calls taskRepository.findOne() and succesffully retrieve and return the task', async () => {
      const mockTask = { title: 'Test task', description: 'Test desc' };

      // returns of function
      taskRepository.findOne.mockResolvedValue(mockTask);

      const result = await tasksService.getTaskById(1, mockUser);
      expect(result).toEqual(mockTask);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          userId: mockUser.id
        }
      })
    });

    it('throws an error as task is not found', () => {
      // returns of function
      taskRepository.findOne.mockResolvedValue(null);

      expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createTask', () => {
    it('calls taskRepository.create() and returns the result', async () => {
      expect(taskRepository.createTask).not.toHaveBeenCalled();

      const mockCreatedTask = { 
        title: 'Test task', 
        description: 'Test desc', 
        status: TaskStatus.OPEN,
        user: mockUser      
      };

      // returns of function
      taskRepository.createTask.mockResolvedValue(mockCreatedTask);

      const filters: CreateTaskDto = {title: 'Test title', description: 'Test desc'};
      const result = await tasksService.createTask(filters, mockUser);
      expect(result).toEqual(mockCreatedTask);

      expect(taskRepository.createTask).toHaveBeenCalledWith(filters, mockUser);
    })
  })
});