'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const roomTypes = [
      {
        id: uuidv4(),
        type: 'Phòng thường',
        amenities: JSON.stringify(['Giường', 'Bàn học', 'Tủ quần áo']),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        type: 'Phòng Thường (Máy lạnh)',
        amenities: JSON.stringify(['Giường', 'Bàn học', 'Tủ quần áo', 'Quạt', 'Máy lạnh']),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        type: 'Phòng Vip',
        amenities: JSON.stringify(['Bàn học', 'Tủ quần áo', 'Điều hòa', 'Máy Giặt']),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('RoomTypes', roomTypes);
    const buildings = [
      { id: uuidv4(), name: 'Tòa G', genderRestriction: 'male', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Tòa H', genderRestriction: 'female', createdAt: new Date(), updatedAt: new Date() }
    ];
    await queryInterface.bulkInsert('Buildings', buildings);
    const buildingRoomTypes = [];

    buildings.forEach(building => {
      roomTypes.forEach(roomType => {
        buildingRoomTypes.push({
          buildingId: building.id,
          roomTypeId: roomType.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
    });

    await queryInterface.bulkInsert('BuildingRoomTypes', buildingRoomTypes);
    const floors = [];
    buildings.forEach(building => {
      for (let i = 1; i <= 3; i++) {
        floors.push({
          id: uuidv4(),
          number: i,
          buildingId: building.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });

    await queryInterface.bulkInsert('Floors', floors);
    const [Floors] = await queryInterface.sequelize.query(`SELECT id, buildingId FROM Floors`);

    const rooms = [];

    floors.forEach(floor => {
      const building = buildings.find(b => b.id === floor.buildingId);
      for (let i = 1; i <= 3; i++) {

        const roomType = roomTypes[i % roomTypes.length];
        const roomNumber = String(building.name).slice(-1) + floor.number + "0" + i
        const capacities = [2, 4, 6];
        const capacity = capacities[Math.floor(Math.random() * capacities.length)];
        rooms.push({
          id: uuidv4(),
          roomNumber: roomNumber,
          capacity: capacity,
          monthlyFee: capacity === 2 ? 100000 : capacity === 4 ? 200000 : 300000,
          floorId: floor.id,
          roomTypeId: roomType.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });

    await queryInterface.bulkInsert('Rooms', rooms);

    const roomSlots = [];

    rooms.forEach(room => {
      for (let i = 1; i <= room.capacity; i++) {
        roomSlots.push({
          id: uuidv4(),
          slotNumber: i,
          isOccupied: false,
          roomId: room.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });

    // 2️⃣ Insert vào RoomSlots
    await queryInterface.bulkInsert('RoomSlots', roomSlots);


    const passwordHash = await bcrypt.hash('123456', 10);

    // ==================== USERS ====================
    const users = [
      {
        id: uuidv4(),
        name: 'Trần Đăng Ninh',
        identification: '060203015004',
        gender: 'male',
        email: 'trandangninh@gmail.com',
        phone: '0915726782',
        dob: new Date('2004-06-30'),
        nation: 'Việt Nam',
        region: 'Không',
        address: 'Phường Bình Thuận, Tỉnh Lâm Đồng',
        password: passwordHash,
        status: 'APPROVED_NOT_CHANGED',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // 20 sinh viên mẫu
    const studentNames = [
      'Nguyễn Thị Thu Hà', 'Lê Văn Long', 'Phạm Thị Kim Ngân', 'Vũ Quốc Huy', 'Trần Anh Dũng',
      'Ngô Minh Hào', 'Bùi Ngọc Trâm', 'Phạm Văn Hoàng', 'Nguyễn Tấn Phát', 'Trương Mỹ Duyên',
      'Lâm Quốc Bảo', 'Lê Hoàng Anh', 'Nguyễn Đức Minh', 'Phan Thị Ngọc Bích', 'Võ Thành Nhân',
      'Đặng Quang Huy', 'Trịnh Hồng Nhung', 'Nguyễn Quốc Khánh', 'Phạm Văn Tuấn', 'Lưu Thị Lan',
      'Nguyễn Minh Tuấn', 'Trần Thị Thu', 'Phạm Văn An', 'Vũ Thị Hạnh', 'Lê Đức Tài',
      'Ngô Thị Lan', 'Bùi Văn Hùng', 'Phạm Thị Mai', 'Nguyễn Hoàng Long', 'Trương Thị Ly',
      'Lâm Thị Hồng', 'Lê Văn Sơn', 'Nguyễn Thị Ngọc', 'Phan Văn Duy', 'Võ Thị Thanh',
      'Đặng Văn Quang', 'Trịnh Thị Hồng', 'Nguyễn Văn Tuấn', 'Phạm Thị Nhung', 'Lưu Văn Khoa'
    ];


    studentNames.forEach((name, index) => {
      users.push({
        id: uuidv4(),
        name,
        identification: `079203015${(100 + index).toString().padStart(3, '0')}`,
        gender: index % 2 === 0 ? 'female' : 'male',
        email: `student${index + 1}@student.hcmute.edu.vn`,
        phone: `090${(1000000 + index).toString().slice(0, 7)}`,
        dob: new Date(`200${3 + (index % 5)}-${(index % 12) + 1}-15`),
        nation: 'Việt Nam',
        region: 'Không',
        address: `Khu phố ${index + 1}, TP. Thủ Đức, TP.HCM`,
        password: passwordHash,
        status: 'REGISTERED',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // 🧩 Thêm toàn bộ user
    try {
      await queryInterface.bulkInsert('Users', users);
      console.log('✅ Users inserted successfully');
    } catch (error) {
      console.error('❌ Error inserting Users:', error);
    }

    // 👑 Admin: chỉ người đầu tiên
    try {
      const admin = {
        id: uuidv4(),
        userId: users[0].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await queryInterface.bulkInsert('Admins', [admin]);
      console.log('✅ Admin inserted successfully');
    } catch (error) {
      console.error('❌ Error inserting Admin:', error);
    }

    try {
      const students = users.slice(1).map((user, index) => ({
        id: uuidv4(),
        userId: user.id,
        mssv: `22110${11 + index}`,
        school: 'Đại học Sư phạm Kỹ thuật TP.HCM',
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await queryInterface.bulkInsert('Students', students);
      console.log('✅ Students inserted successfully');
    } catch (error) {
      console.error('❌ Error inserting Students:', error);
    }


    try {
      const [slots] = await queryInterface.sequelize.query('SELECT id FROM `RoomSlots` ORDER BY "createdAt" ASC');
      const [studentsList] = await queryInterface.sequelize.query('SELECT id FROM `Students` ORDER BY "createdAt" ASC');

      const roomRegistrations = studentsList.map(student => {
        const randomSlot = slots[Math.floor(Math.random() * slots.length)]; // chọn 1 slot ngẫu nhiên
        return {
          id: uuidv4(),
          studentId: student.id,
          roomSlotId: randomSlot.id,
          registerDate: new Date(),
          approvedDate: null,
          endDate: null,
          duration: '8',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });
      await queryInterface.bulkInsert('RoomRegistrations', roomRegistrations);
      console.log('✅ RoomRegistrations inserted successfully');
    } catch (error) {
      console.error('❌ Error inserting RoomRegistrations:', error);
    }
  },


  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Rooms', null, {});
    await queryInterface.bulkDelete('Floors', null, {});
    await queryInterface.bulkDelete('BuildingRoomTypes', null, {});
    await queryInterface.bulkDelete('Buildings', null, {});
    await queryInterface.bulkDelete('RoomTypes', null, {});
    await queryInterface.bulkDelete('RoomSlots', null, {});
    await queryInterface.bulkDelete('Students');
    await queryInterface.bulkDelete('Users');
    await queryInterface.bulkDelete('Admins');
    await queryInterface.bulkDelete('RoomRegistrations')
  }
};
