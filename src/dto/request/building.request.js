class CreateBuildingRequest {
  constructor(data) {
    this.name = data.name;
    this.genderRestriction = data.genderRestriction;
    this.roomTypeIds = data.roomTypeIds;
    this.numberFloor = data.numberFloor;
  }
}

class UpdateBuildingRequest {
  constructor(data) {
    this.id = data.id;
    if (data.name !== undefined) {
      this.name = data.name;
    }

    if (data.genderRestriction !== undefined) {
      this.genderRestriction = data.genderRestriction;
    }

    if (data.roomTypeIds !== undefined) {
      this.roomTypeIds = data.roomTypeIds;
    }

    if (data.numberFloor !== undefined) {
      this.numberFloor = data.numberFloor;
    }
  }
}


class DeleteBuildingRequest {
  constructor(data) {
    this.id = data.id;
  }
}

class GetBuildingRequest {
  constructor(data) {
    this.genderRestriction = data.genderRestriction;
    this.roomTypeId = data.roomTypeId;
  }
}

module.exports = { CreateBuildingRequest, UpdateBuildingRequest, GetBuildingRequest, DeleteBuildingRequest };