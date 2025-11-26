class CreateBuildingResponse {
  constructor(data) {
    this.name = data.name;
    this.genderRestriction = data.genderRestriction;
  }
}


class GetBuildingByGenderRestrictionResponse {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.genderRestriction = data.genderRestriction;
  }
}

class GetBuildingResponse {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.genderRestriction = data.genderRestriction;
    this.numberFloor = data.dataValues.numberFloor;
    this.roomTypes = data.dataValues.roomTypes
      ? data.dataValues.roomTypes.map(rt => ({ id: rt.id, type: rt.type, amenities: rt.amenities }))
      : [];
  }
}

module.exports = { CreateBuildingResponse, GetBuildingByGenderRestrictionResponse, GetBuildingResponse };