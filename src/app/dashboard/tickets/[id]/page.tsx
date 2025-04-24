import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import TicketHeader from './components/ticket-header';
import TicketActions from './components/ticket-actions';
import TicketCommentsTab from './components/ticket-comments-tab';
import TicketAttachmentsTab from './components/ticket-attachments-tab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import {
  User,
  CircleUser,
  Tag,
  Clock,
  CalendarClock,
  Building,
  Monitor
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function TicketPage({
  params
}: {
  params: { id: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    return notFound();
  }

  const ticket = await db.ticket.findUnique({
    where: { id: params.id },
    include: {
      asset: true,
      requestedAsset: {
        include: {
          room: {
            include: {
              floor: {
                include: {
                  building: true
                }
              }
            }
          }
        }
      },
      room: {
        include: {
          floor: {
            include: {
              building: true
            }
          }
        }
      },
      comments: {
        orderBy: {
          createdAt: 'desc'
        }
      },
      attachments: true
    }
  });

  if (!ticket) {
    return notFound();
  }

  // Fetch creator and assignee separately
  const [creator, assignee] = await Promise.all([
    ticket.createdById
      ? db.user.findUnique({
          where: { id: ticket.createdById },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        })
      : null,
    ticket.assignedToId
      ? db.user.findUnique({
          where: { id: ticket.assignedToId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        })
      : null
  ]);

  // Function to format room location
  const formatRoomLocation = (room: any) => {
    if (!room) return 'None';

    return `${room.floor.building.name} - Floor ${room.floor.number} - Room ${room.number}${room.name ? ` (${room.name})` : ''}`;
  };

  // Format the time part of a datetime
  const formatTimeOnly = (dateStr: Date | null) => {
    if (!dateStr) return '';
    return format(dateStr, 'HH:mm');
  };

  // Capitalize first letter
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status.replace('_', ' ');
  };

  // Format user name
  const formatUserName = (user: any) => {
    if (!user) return 'Unassigned';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email || user.id;
  };

  return (
    <div className='m-6 h-[calc(100vh-50px)] overflow-y-auto'>
      <div className='container mx-auto space-y-6 py-6'>
        <TicketHeader ticket={ticket} />

        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          <div className='md:col-span-2'>
            <Tabs defaultValue='details' className='w-full'>
              <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger value='details'>Details</TabsTrigger>
                <TabsTrigger value='comments'>Comments</TabsTrigger>
                <TabsTrigger value='attachments'>Attachments</TabsTrigger>
              </TabsList>
              <TabsContent
                value='details'
                className='space-y-6 rounded-md border p-6'
              >
                {/* Basic ticket information */}
                <div className='space-y-4'>
                  <div>
                    <h3 className='flex items-center gap-2 text-lg font-semibold'>
                      <Tag className='h-5 w-5' />
                      Ticket Information
                    </h3>
                    <div className='mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2'>
                      <div className='space-y-2'>
                        <div>
                          <span className='text-muted-foreground text-sm'>
                            ID:
                          </span>
                          <p className='font-mono text-sm'>{ticket.id}</p>
                        </div>
                        <div>
                          <span className='text-muted-foreground text-sm'>
                            Title:
                          </span>
                          <p className='font-medium'>{ticket.title}</p>
                        </div>
                        <div>
                          <span className='text-muted-foreground text-sm'>
                            Type:
                          </span>
                          <p>{formatStatus(ticket.ticketType)}</p>
                        </div>
                        <div>
                          <span className='text-muted-foreground text-sm'>
                            Priority:
                          </span>
                          <p>{ticket.priority}</p>
                        </div>
                        <div>
                          <span className='text-muted-foreground text-sm'>
                            Status:
                          </span>
                          <p>{formatStatus(ticket.status)}</p>
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <div>
                          <span className='text-muted-foreground text-sm'>
                            Created:
                          </span>
                          <p>{format(ticket.createdAt, 'PPP p')}</p>
                        </div>
                        <div>
                          <span className='text-muted-foreground text-sm'>
                            Last Updated:
                          </span>
                          <p>{format(ticket.updatedAt, 'PPP p')}</p>
                        </div>
                        {ticket.resolvedAt && (
                          <div>
                            <span className='text-muted-foreground text-sm'>
                              Resolved:
                            </span>
                            <p>{format(ticket.resolvedAt, 'PPP p')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* People section */}
                  <div className='border-t pt-4'>
                    <h3 className='flex items-center gap-2 text-lg font-semibold'>
                      <User className='h-5 w-5' />
                      People
                    </h3>
                    <div className='mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2'>
                      <div>
                        <span className='text-muted-foreground text-sm'>
                          Created by:
                        </span>
                        <p className='flex items-center gap-1'>
                          <CircleUser className='text-muted-foreground h-4 w-4' />
                          {formatUserName(creator)}
                          {creator?.role && (
                            <span className='bg-primary ml-1 rounded-full px-2 py-0.5 text-xs'>
                              {capitalize(creator.role)}
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <span className='text-muted-foreground text-sm'>
                          Assigned to:
                        </span>
                        <p className='flex items-center gap-1'>
                          <CircleUser className='text-muted-foreground h-4 w-4' />
                          {formatUserName(assignee)}
                          {assignee?.role && (
                            <span className='ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs'>
                              {capitalize(assignee.role)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Location section */}
                  {ticket.room && (
                    <div className='border-t pt-4'>
                      <h3 className='flex items-center gap-2 text-lg font-semibold'>
                        <Building className='h-5 w-5' />
                        Location
                      </h3>
                      <div className='mt-3'>
                        <span className='text-muted-foreground text-sm'>
                          Room:
                        </span>
                        <p>{formatRoomLocation(ticket.room)}</p>
                      </div>
                    </div>
                  )}

                  {/* Asset section */}
                  {ticket.asset && (
                    <div className='border-t pt-4'>
                      <h3 className='flex items-center gap-2 text-lg font-semibold'>
                        <Monitor className='h-5 w-5' />
                        Related Asset
                      </h3>
                      <div className='mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2'>
                        <div>
                          <span className='text-muted-foreground text-sm'>
                            Asset ID:
                          </span>
                          <p>{ticket.asset.assetTag || ticket.asset.id}</p>
                        </div>
                        <div>
                          <span className='text-muted-foreground text-sm'>
                            Type:
                          </span>
                          <p>{ticket.asset.assetType}</p>
                        </div>
                        <div>
                          <span className='text-muted-foreground text-sm'>
                            Status:
                          </span>
                          <p>{formatStatus(ticket.asset.status)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description section */}
                  <div className='border-t pt-4'>
                    <h3 className='text-lg font-semibold'>Description</h3>
                    <p className='mt-2 whitespace-pre-wrap'>
                      {ticket.description}
                    </p>
                  </div>

                  {/* Ticket Type Specific Information */}
                  {ticket.ticketType !== 'ISSUE_REPORT' && (
                    <div className='border-t pt-4'>
                      <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold'>
                        <CalendarClock className='h-5 w-5' />
                        {ticket.ticketType === 'ROOM_REQUEST'
                          ? 'Room Request Details'
                          : 'Asset Request Details'}
                      </h3>

                      {ticket.ticketType === 'ROOM_REQUEST' && ticket.room && (
                        <div className='space-y-2'>
                          <div>
                            <span className='text-muted-foreground text-sm'>
                              Requested Room:
                            </span>
                            <p>{formatRoomLocation(ticket.room)}</p>
                          </div>
                          {ticket.dayOfWeek && (
                            <div>
                              <span className='text-muted-foreground text-sm'>
                                Day:
                              </span>
                              <p>{capitalize(ticket.dayOfWeek)}</p>
                            </div>
                          )}
                          {ticket.startTime && ticket.endTime && (
                            <div>
                              <span className='text-muted-foreground text-sm'>
                                Time:
                              </span>
                              <p>
                                {formatTimeOnly(ticket.startTime)} -{' '}
                                {formatTimeOnly(ticket.endTime)}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {ticket.ticketType === 'ASSET_REQUEST' &&
                        ticket.requestedAsset && (
                          <div className='space-y-2'>
                            <div>
                              <span className='text-muted-foreground text-sm'>
                                Requested Asset:
                              </span>
                              <p>
                                {ticket.requestedAsset.assetTag ||
                                  ticket.requestedAsset.id}{' '}
                                - {ticket.requestedAsset.assetType}
                              </p>
                            </div>
                            {ticket.requestedAsset.room && (
                              <div>
                                <span className='text-muted-foreground text-sm'>
                                  From Room:
                                </span>
                                <p>
                                  {formatRoomLocation(
                                    ticket.requestedAsset.room
                                  )}
                                </p>
                              </div>
                            )}
                            <div>
                              <span className='text-muted-foreground text-sm'>
                                Asset Status:
                              </span>
                              <p>
                                {formatStatus(ticket.requestedAsset.status)}
                              </p>
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value='comments'>
                <TicketCommentsTab ticketId={ticket.id} />
              </TabsContent>
              <TabsContent value='attachments'>
                <TicketAttachmentsTab ticketId={ticket.id} />
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <TicketActions ticket={ticket} />
          </div>
        </div>
      </div>
    </div>
  );
}
