class CreateBuildingResponse {
  constructor(data) {
    this.name = data.name;
    this.genderRestriction = data.genderRestriction;
  }
}


class GetBuildingResponse {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.genderRestriction = data.genderRestriction;
  }
}

module.exports = { CreateBuildingResponse, GetBuildingResponse };