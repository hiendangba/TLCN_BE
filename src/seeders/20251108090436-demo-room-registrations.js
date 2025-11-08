'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const roomTypes = [
      {
        id: uuidv4(),
        type: '2 người',
        amenities: JSON.stringify(['Giường', 'Bàn học', 'Tủ quần áo']),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        type: '4 người',
        amenities: JSON.stringify(['Giường', 'Bàn học', 'Tủ quần áo', 'Quạt']),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        type: '6 người',
        amenities: JSON.stringify(['Giường', 'Bàn học', 'Tủ quần áo', 'Quạt', 'Điều hòa']),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('RoomTypes', roomTypes);
    const buildings = [
      { id: uuidv4(), name: 'Tòa A', genderRestriction: 'male', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Tòa B', genderRestriction: 'female', createdAt: new Date(), updatedAt: new Date() }
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
      // Giả lập mỗi tòa có 3 tầng
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

    // 2️⃣ Tạo 2 phòng/tầng
    Floors.forEach(floor => {
      // Giả lập 2 phòng mỗi tầng
      for (let i = 1; i <= 2; i++) {
        // Chọn RoomType theo tầng hoặc random
        const roomType = roomTypes[i % roomTypes.length]; // ví dụ luân phiên
        rooms.push({
          id: uuidv4(),
          roomNumber: `T${floor.id.substring(0, 4)}-P${i}`, // phòng dễ nhận diện
          capacity: roomType.type.includes('2') ? 2 : roomType.type.includes('4') ? 4 : 6,
          monthlyFee: roomType.type.includes('2') ? 100 : roomType.type.includes('4') ? 200 : 300, // ví dụ phí
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



    const passwordHash = await bcrypt.hash('123456', 10); // bạn có thể đổi mật khẩu mặc định
    const userId = uuidv4();

    try {
      await queryInterface.bulkInsert('Users', [
        {
          id: userId,
          name: 'Trần Đăng Ninh',
          identification: '060203015004',
          gender: 'male',
          email: 'trandangninh@gmail.com',
          phone: '0915726782',
          dob: new Date('2004-06-30'),
          nation: 'Viet Nam',
          region: 'Không',
          address: 'Phường Bình Thuận, Tỉnh Lâm Đồng',
          password: passwordHash,
          status: 'APPROVED_NOT_CHANGED',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    } catch (error) {
      console.error('Error inserting Users:', error);
    }

    try {
      await queryInterface.bulkInsert('Admins', [
        {
          id: uuidv4(),
          userId: userId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    } catch (error) {
      console.error('Error inserting Admins:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Rooms', null, {});
    await queryInterface.bulkDelete('Floors', null, {});
    await queryInterface.bulkDelete('BuildingRoomTypes', null, {});
    await queryInterface.bulkDelete('Buildings', null, {});
    await queryInterface.bulkDelete('RoomTypes', null, {});
    await queryInterface.bulkDelete('RoomSlots', null, {});
    await queryInterface.bulkDelete('Admins');
    await queryInterface.bulkDelete('Users');
  }
};
