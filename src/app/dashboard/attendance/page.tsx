'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { CalendarIcon, CheckIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';

const attendanceFormSchema = z.object({
  scheduleId: z.string({
    required_error: 'Please select a schedule'
  }),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  section: z.string().min(1, 'Section is required'),
  yearLevel: z.string().min(1, 'Year level is required'),
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
  systemUnit: z.boolean(),
  keyboard: z.boolean(),
  mouse: z.boolean(),
  internet: z.boolean(),
  ups: z.boolean()
});

type AttendanceFormValues = z.infer<typeof attendanceFormSchema>;

export default function AttendancePage() {
  const [ isLoading, setIsLoading ] = useState(false);
  const [ schedules, setSchedules ] = useState<any[]>([]);
  const [ showReport, setShowReport ] = useState(false);
  const router = useRouter();

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      section: '',
      yearLevel: '',
      subject: '',
      description: '',
      systemUnit: true,
      keyboard: true,
      mouse: true,
      internet: true,
      ups: true
    }
  });

  // Load schedules from API with retry logic
  useEffect(() => {
    const fetchSchedules = async (retryCount = 0) => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/schedules', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          next: { revalidate: 0 } // Ensure fresh data
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Schedule API result:', result);

        if (result.success && Array.isArray(result.data)) {
          console.log(`Found ${result.data.length} schedules`);

          // Sort schedules by day of week and start time
          const sortedSchedules = [ ...result.data ].sort((a, b) => {
            const dayOrder = {
              'monday': 1,
              'tuesday': 2,
              'wednesday': 3,
              'thursday': 4,
              'friday': 5,
              'saturday': 6,
              'sunday': 7
            };

            // First sort by day
            const dayDiff = (dayOrder[ a.dayOfWeek ] || 0) - (dayOrder[ b.dayOfWeek ] || 0);
            if (dayDiff !== 0) return dayDiff;

            // Then by time
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
          });

          setSchedules(sortedSchedules);
        } else if (Array.isArray(result)) {
          console.log(`Found ${result.length} schedules (array format)`);
          setSchedules(result);
        } else {
          console.error('Invalid response format:', result);

          // Retry logic
          if (retryCount < 2) {
            console.log(`Retrying schedule fetch (attempt ${retryCount + 1})...`);
            setTimeout(() => fetchSchedules(retryCount + 1), 1000);
            return;
          }

          toast('Warning', {
            description: 'Unexpected data format from server. Please contact support.'
          });
          setSchedules([]);
        }
      } catch (error) {
        console.error('Error fetching schedules:', error);

        // Retry logic for errors
        if (retryCount < 2) {
          console.log(`Retrying after error (attempt ${retryCount + 1})...`);
          setTimeout(() => fetchSchedules(retryCount + 1), 1000);
          return;
        }

        toast('Error', {
          description: 'Failed to load schedules. Please try again or contact support.'
        });
        setSchedules([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  function onSubmit(data: AttendanceFormValues) {
    setIsLoading(true);

    // Validate required fields
    if (!data.scheduleId) {
      toast('Error', {
        description: 'Please select a schedule before submitting'
      });
      setIsLoading(false);
      return;
    }

    // Check if all equipment is checked
    const allEquipmentChecked =
      data.systemUnit &&
      data.keyboard &&
      data.mouse &&
      data.internet &&
      data.ups;

    if (!allEquipmentChecked) {
      setShowReport(true);
      setIsLoading(false);
      return;
    }

    // Submit attendance directly if all equipment is checked
    submitAttendance(data);
  }

  function submitAttendance(data: AttendanceFormValues, createTicket = false) {
    setIsLoading(true);

    // First check database connectivity
    fetch('/api/ping')
      .then((response) => response.json())
      .then((pingData) => {
        console.log('Database connection status:', pingData);

        if (!pingData.success) {
          throw new Error(
            'Database connection issue: ' + (pingData.error || 'Unknown error')
          );
        }

        // Database is connected, proceed with the attendance submission
        return fetch('/api/attendance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...data,
            createTicket
          })
        });
      })
      .then(async (response) => {
        const responseData = await response.json();
        console.log('API Response:', responseData);

        if (!response.ok) {
          // Handle specific error cases
          if (response.status === 401) {
            // Authentication error - this should no longer happen
            throw new Error('You need to be logged in to submit attendance');
          } else {
            throw new Error(
              responseData.details ||
              responseData.error ||
              'Failed to submit attendance'
            );
          }
        }

        return responseData;
      })
      .then((data) => {
        console.log('Attendance submitted successfully:', data);
        toast('Success', {
          description: 'Attendance has been recorded successfully'
        });

        // Navigate to dashboard if possible, or home page if not authenticated
        // We assume a non-authenticated user won't be able to access the dashboard
        try {
          router.push('/dashboard');
        } catch (error) {
          console.log('Navigation to dashboard failed, redirecting to home');
          router.push('/');
        }
      })
      .catch((error) => {
        console.error('Error submitting attendance:', error);
        toast('Error', {
          description:
            error.message || 'Failed to submit attendance. Please try again.'
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleReportApprove() {
    // Submit with ticket creation flag
    submitAttendance(form.getValues(), true);
  }

  function handleReportReject() {
    // Reset form and hide report
    setShowReport(false);
  }

  return (
    <div className='m-6 h-[calc(100vh-50px)] overflow-y-auto'>
      <div className='container mx-auto py-10'>
        <h1 className='mb-6 text-2xl font-bold'>Student Attendance</h1>

        {showReport ? (
          <Card>
            <CardHeader>
              <CardTitle>Equipment Issue Report</CardTitle>
              <CardDescription>
                One or more equipment items are not checked. A ticket needs to
                be created before proceeding.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <h3 className='font-medium'>Student Information</h3>
                  <p>
                    Name: {form.getValues('firstName')}{' '}
                    {form.getValues('lastName')}
                  </p>
                  <p>Email: {form.getValues('email')}</p>
                  <p>Section: {form.getValues('section')}</p>
                  <p>Year Level: {form.getValues('yearLevel')}</p>
                </div>

                <div>
                  <h3 className='font-medium'>Equipment Status</h3>
                  <ul className='list-disc space-y-1 pl-5'>
                    {!form.getValues('systemUnit') && (
                      <li>System Unit: Not Available</li>
                    )}
                    {!form.getValues('keyboard') && (
                      <li>Keyboard: Not Available</li>
                    )}
                    {!form.getValues('mouse') && <li>Mouse: Not Available</li>}
                    {!form.getValues('internet') && (
                      <li>Internet: Not Available</li>
                    )}
                    {!form.getValues('ups') && <li>UPS: Not Available</li>}
                  </ul>
                </div>

                <div>
                  <h3 className='font-medium'>Description</h3>
                  <p>
                    {form.getValues('description') ||
                      'No description provided.'}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className='flex justify-between'>
              <Button variant='outline' onClick={handleReportReject}>
                Cancel
              </Button>
              <Button onClick={handleReportApprove} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Processing
                  </>
                ) : (
                  'Approve & Create Ticket'
                )}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              <Card>
                <CardHeader>
                  <CardTitle>Student Attendance Form</CardTitle>
                  <CardDescription>
                    Please fill out all required fields to record your
                    attendance.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Schedule Selection */}
                  <FormField
                    control={form.control}
                    name='scheduleId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schedule</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={isLoading ? "Loading schedules..." : "Select a schedule"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoading ? (
                              <SelectItem value="loading" disabled>
                                <div className="flex items-center">
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Loading schedules...
                                </div>
                              </SelectItem>
                            ) : schedules.length === 0 ? (
                              <SelectItem value="no-schedules" disabled>No schedules available</SelectItem>
                            ) : (
                              schedules.map((schedule: any) => (
                                <SelectItem key={schedule.id} value={schedule.id}>
                                  {schedule.dayOfWeek.charAt(0).toUpperCase() + schedule.dayOfWeek.slice(1)}: {schedule.title} - {schedule.user?.firstName || 'Unknown'}{' '}
                                  {schedule.user?.lastName || 'User'} ({schedule.room?.number || 'No Room'})
                                  {schedule.startTime ? ` ${format(new Date(schedule.startTime), 'h:mm a')}` : ''}{' '}
                                  - {schedule.endTime ? format(new Date(schedule.endTime), 'h:mm a') : ''}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the schedule for your class
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Student Information */}
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name='firstName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Enter your first name'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='lastName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Enter your last name'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='email'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder='Enter your email' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='section'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Section</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Enter your section'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='yearLevel'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year Level</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder='Select year level' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value='1'>First Year</SelectItem>
                              <SelectItem value='2'>Second Year</SelectItem>
                              <SelectItem value='3'>Third Year</SelectItem>
                              <SelectItem value='4'>Fourth Year</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='subject'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Enter your subject'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Equipment Checklist */}
                  <div>
                    <h3 className='mb-3 text-sm font-medium'>
                      Equipment Checklist
                    </h3>
                    <div className='space-y-4'>
                      <FormField
                        control={form.control}
                        name='systemUnit'
                        render={({ field }) => (
                          <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className='space-y-1 leading-none'>
                              <FormLabel>System Unit</FormLabel>
                              <FormDescription>
                                Working properly and available
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='keyboard'
                        render={({ field }) => (
                          <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className='space-y-1 leading-none'>
                              <FormLabel>Keyboard</FormLabel>
                              <FormDescription>
                                Working properly and available
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='mouse'
                        render={({ field }) => (
                          <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className='space-y-1 leading-none'>
                              <FormLabel>Mouse</FormLabel>
                              <FormDescription>
                                Working properly and available
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='internet'
                        render={({ field }) => (
                          <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className='space-y-1 leading-none'>
                              <FormLabel>Internet</FormLabel>
                              <FormDescription>
                                Connected and working properly
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='ups'
                        render={({ field }) => (
                          <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className='space-y-1 leading-none'>
                              <FormLabel>UPS</FormLabel>
                              <FormDescription>
                                Working properly and available
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name='description'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Provide additional details or notes about the equipment status'
                            className='resize-none'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Use this field to report any issues or provide
                          additional information
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type='submit' disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Submitting
                      </>
                    ) : (
                      'Submit Attendance'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        )}

        {/* Hidden admin button for database repair */}
        <div className='mt-8 text-center'>
          <Button
            variant='outline'
            size='sm'
            className='text-xs opacity-30 hover:opacity-100'
            onClick={() => {
              fetch('/api/attendance/repair')
                .then((res) => res.json())
                .then((data) => {
                  if (data.success) {
                    toast.success('Database repaired successfully', {
                      description: data.message
                    });
                  } else {
                    toast.error('Database repair failed', {
                      description: data.error
                    });
                  }
                })
                .catch((err) => {
                  toast.error('Database repair failed', {
                    description: err.message
                  });
                });
            }}
          >
            Repair Database
          </Button>
        </div>
      </div>
    </div>
  );
}
