class CreateBuildingRequest {
  constructor(data) {
    this.name = data.name;
    this.genderRestriction = data.genderRestriction;
    this.roomTypeIds = data.roomTypeIds;
  }
}

module.exports = {CreateBuildingRequest};