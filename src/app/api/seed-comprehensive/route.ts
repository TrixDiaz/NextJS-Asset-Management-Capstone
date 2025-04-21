import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AssetStatus, AssetType, RoomType } from '@prisma/client';

// Helper to generate random integers between min and max (inclusive)
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper to generate random dates within a range
const randomDate = (start: Date, end: Date): Date => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

// Helper to get a random element from an array
const randomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Helper to generate a random asset tag
const generateAssetTag = (): string => {
  return `AST-${randomInt(1000, 9999)}-${randomInt(100, 999)}`;
};

// Helper to generate a random serial number
const generateSerialNumber = (): string => {
  return `SN-${randomInt(100000, 999999)}`;
};

// Days of the week for schedules
const daysOfWeek = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday'
];

export async function GET(_req: NextRequest) {
  try {
    console.log('Starting comprehensive database seeding...');

    // Check if prisma client is initialized
    if (!prisma) {
      return NextResponse.json(
        { success: false, error: 'Database connection not initialized' },
        { status: 500 }
      );
    }

    // Create results object to track what we've created
    const results = {
      created: {
        users: 0,
        buildings: 0,
        floors: 0,
        rooms: 0,
        assets: 0,
        storageItems: 0,
        schedules: 0,
        deploymentRecords: 0,
        maintenanceRecords: 0
      }
    };

    // 1. Create or get an admin user
    let adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          clerkId: 'admin_clerk_id',
          firstName: 'Admin',
          lastName: 'User',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin'
        }
      });
      results.created.users++;
    }

    // Create additional users (teachers, staff)
    const userRoles = ['admin', 'moderator', 'member'];
    const userFirstNames = [
      'John',
      'Jane',
      'Alex',
      'Maria',
      'David',
      'Sarah',
      'Mark',
      'Lisa'
    ];
    const userLastNames = [
      'Smith',
      'Johnson',
      'Williams',
      'Jones',
      'Brown',
      'Davis',
      'Miller',
      'Wilson'
    ];

    for (let i = 0; i < 10; i++) {
      const firstName = randomElement(userFirstNames);
      const lastName = randomElement(userLastNames);
      const role = randomElement(userRoles);

      await prisma.user.create({
        data: {
          clerkId: `clerk_${firstName.toLowerCase()}_${lastName.toLowerCase()}_${i}`,
          firstName,
          lastName,
          username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
          role
        }
      });
      results.created.users++;
    }

    // Get all users for later use in schedules
    const allUsers = await prisma.user.findMany();

    // 2. Create Buildings (3)
    const buildingNames = [
      'Main Campus',
      'Science Building',
      'Technology Center'
    ];
    const buildingCodes = ['MC', 'SB', 'TC'];
    const buildings = [];

    for (let i = 0; i < buildingNames.length; i++) {
      const building = await prisma.building.create({
        data: {
          name: buildingNames[i],
          code: buildingCodes[i],
          address: `${randomInt(100, 999)} University Avenue`
        }
      });
      buildings.push(building);
      results.created.buildings++;
    }

    // 3. Create Floors (2-4 per building)
    const floors = [];
    for (const building of buildings) {
      const floorCount = randomInt(2, 4);
      for (let i = 1; i <= floorCount; i++) {
        const floor = await prisma.floor.create({
          data: {
            number: i,
            name: `${building.name} Floor ${i}`,
            buildingId: building.id
          }
        });
        floors.push(floor);
        results.created.floors++;
      }
    }

    // 4. Create Rooms (5-10 per floor)
    const roomTypes = Object.values(RoomType);
    const rooms = [];
    let storageRooms = [];

    for (const floor of floors) {
      const roomCount = randomInt(5, 10);
      for (let i = 1; i <= roomCount; i++) {
        const roomNumber = `${floor.number}${i.toString().padStart(2, '0')}`;
        const roomType = randomElement(roomTypes);

        const room = await prisma.room.create({
          data: {
            number: roomNumber,
            name: `${roomType.charAt(0) + roomType.slice(1).toLowerCase()} ${roomNumber}`,
            type: roomType,
            floorId: floor.id
          }
        });

        rooms.push(room);
        if (room.type === 'STORAGE') {
          storageRooms.push(room);
        }
        results.created.rooms++;
      }
    }

    // 5. Create Storage Items (20-30)
    const storageItemTypes = ['CABLE', 'SOFTWARE', 'HARDWARE', 'COMPUTER_PART'];
    const storageItemSubTypes = {
      CABLE: ['USB', 'HDMI', 'VGA', 'ETHERNET', 'POWER'],
      SOFTWARE: [
        'OPERATING_SYSTEM',
        'OFFICE',
        'ANTIVIRUS',
        'DESIGN',
        'DEVELOPMENT'
      ],
      HARDWARE: ['KEYBOARD', 'MOUSE', 'HEADSET', 'WEBCAM', 'EXTERNAL_DRIVE'],
      COMPUTER_PART: ['SYSTEM_UNIT', 'MONITOR', 'UPS', 'RAM', 'CPU', 'GPU']
    };

    const storageItems = [];
    const storageItemCount = randomInt(20, 30);

    for (let i = 1; i <= storageItemCount; i++) {
      const itemType = randomElement(storageItemTypes);
      const subTypes =
        storageItemSubTypes[itemType as keyof typeof storageItemSubTypes];
      const subType = randomElement(subTypes);

      const serialNumbers = Array.from({ length: randomInt(1, 5) }, () =>
        generateSerialNumber()
      );

      const storageItem = await prisma.storageItem.create({
        data: {
          name: `${subType} ${itemType}`,
          itemType,
          subType,
          quantity: serialNumbers.length,
          unit: itemType === 'CABLE' ? 'meters' : 'pieces',
          serialNumbers,
          remarks: `Stock of ${subType} ${itemType.toLowerCase()}`
        }
      });

      storageItems.push(storageItem);
      results.created.storageItems++;
    }

    // 6. Create Assets in each room (excluding storage rooms)
    const nonStorageRooms = rooms.filter((room) => room.type !== 'STORAGE');
    const assetStatuses = Object.values(AssetStatus);
    const assetTypes = Object.values(AssetType);

    for (const room of nonStorageRooms) {
      // Each room gets 1-5 assets
      const assetCount = randomInt(1, 5);

      for (let i = 0; i < assetCount; i++) {
        const assetType = randomElement(assetTypes);
        const status = randomElement(assetStatuses);

        const asset = await prisma.asset.create({
          data: {
            assetTag: generateAssetTag(),
            assetType,
            systemUnit:
              assetType === 'COMPUTER' ? generateSerialNumber() : null,
            monitor: assetType === 'COMPUTER' ? generateSerialNumber() : null,
            ups: assetType === 'COMPUTER' ? generateSerialNumber() : null,
            status,
            remarks: status !== 'WORKING' ? `Needs attention: ${status}` : null,
            roomId: room.id
          }
        });

        results.created.assets++;

        // Create maintenance records for assets that need repair
        if (status === 'NEEDS_REPAIR' || status === 'UNDER_MAINTENANCE') {
          await prisma.maintenanceRecord.create({
            data: {
              assetId: asset.id,
              date: randomDate(new Date(2023, 0, 1), new Date()),
              description: `Scheduled maintenance for ${assetType}`,
              technician:
                randomElement(
                  allUsers.filter(
                    (u) => u.role === 'technician' || u.role === 'admin'
                  )
                ).username || 'Unknown',
              status: status === 'UNDER_MAINTENANCE' ? 'IN_PROGRESS' : 'PENDING'
            }
          });
          results.created.maintenanceRecords++;
        }
      }
    }

    // Get all assets for deployment records
    const allAssets = await prisma.asset.findMany();

    // 7. Create Deployment Records (for some assets and storage items)
    // Deploy some assets from storage to rooms
    for (let i = 0; i < randomInt(5, 15); i++) {
      const asset = randomElement(allAssets);
      const fromRoom = randomElement(storageRooms);
      const toRoom = randomElement(nonStorageRooms);
      const deployedBy =
        randomElement(
          allUsers.filter((u) => u.role === 'admin' || u.role === 'technician')
        ).username || 'Unknown';

      await prisma.deploymentRecord.create({
        data: {
          assetId: asset.id,
          fromRoomId: fromRoom?.id,
          toRoomId: toRoom.id,
          date: randomDate(new Date(2023, 0, 1), new Date()),
          deployedBy,
          remarks: `Deployed ${asset.assetType} to ${toRoom.name}`
        }
      });

      results.created.deploymentRecords++;
    }

    // Deploy some storage items
    for (let i = 0; i < randomInt(5, 15); i++) {
      const storageItem = randomElement(storageItems);
      const quantity = randomInt(1, Math.min(3, storageItem.quantity));
      const toRoom = randomElement(nonStorageRooms);
      const deployedBy =
        randomElement(
          allUsers.filter((u) => u.role === 'admin' || u.role === 'technician')
        ).username || 'Unknown';

      await prisma.deploymentRecord.create({
        data: {
          storageItemId: storageItem.id,
          quantity,
          serialNumber:
            storageItem.serialNumbers.length > 0
              ? storageItem.serialNumbers[0]
              : null,
          toRoomId: toRoom.id,
          date: randomDate(new Date(2023, 0, 1), new Date()),
          deployedBy,
          remarks: `Deployed ${quantity} ${storageItem.unit} of ${storageItem.name} to ${toRoom.name}`
        }
      });

      results.created.deploymentRecords++;
    }

    // 8. Create Schedules for rooms
    // Create schedules for classrooms and laboratories
    const classroomsAndLabs = rooms.filter(
      (room) => room.type === 'CLASSROOM' || room.type === 'LABORATORY'
    );

    for (const room of classroomsAndLabs) {
      // Each room gets 3-8 schedules per week
      const scheduleCount = randomInt(3, 8);

      for (let i = 0; i < scheduleCount; i++) {
        const dayOfWeek = randomElement(daysOfWeek);
        const user = randomElement(
          allUsers.filter((u) => u.role === 'teacher')
        );

        // Generate start time between 8 AM and 5 PM
        const startHour = randomInt(8, 17);
        const startMinute = randomElement([0, 30]);
        const startTime = new Date();
        startTime.setHours(startHour, startMinute, 0, 0);

        // Class duration: 1-3 hours
        const durationHours = randomInt(1, 3);
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + durationHours);

        await prisma.schedule.create({
          data: {
            title: `Class ${i + 1} in ${room.name}`,
            description: `Regular schedule for ${dayOfWeek}`,
            startTime,
            endTime,
            dayOfWeek,
            userId: user.id,
            roomId: room.id
          }
        });

        results.created.schedules++;
      }
    }

    // Return success response with counts
    return NextResponse.json({
      success: true,
      message: 'Comprehensive sample data created successfully',
      results
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to seed database',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
