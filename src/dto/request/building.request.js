class CreateBuildingRequest {
  constructor(data) {
    this.name = data.name;
    this.genderRestriction = data.genderRestriction;
    this.roomTypeIds = data.roomTypeIds;
  }
}
class GetBuildingRequest {
  constructor(data) {
    this.genderRestriction = data.genderRestriction;
    this.roomTypeId = data.roomTypeId;
  }
}
module.exports = { CreateBuildingRequest, GetBuildingRequest };