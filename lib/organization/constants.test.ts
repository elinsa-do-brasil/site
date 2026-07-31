import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ETHICS_COMMITTEE_TEAM,
  getRequiredTeamForOrganizationRoleList,
  getRequiredTeamsForOrganizationRoleList,
  PSYCHOLOGICAL_CARE_TEAM,
} from "./constants";

describe("organization role team requirements", () => {
  it("maps each protected role to its required team", () => {
    assert.equal(
      getRequiredTeamForOrganizationRoleList("ethics"),
      ETHICS_COMMITTEE_TEAM,
    );
    assert.equal(
      getRequiredTeamForOrganizationRoleList("psychological_care"),
      PSYCHOLOGICAL_CARE_TEAM,
    );
  });

  it("returns every required team for combined roles", () => {
    assert.deepEqual(
      getRequiredTeamsForOrganizationRoleList(
        "member,psychological_care,ethics",
      ),
      [PSYCHOLOGICAL_CARE_TEAM, ETHICS_COMMITTEE_TEAM],
    );
  });

  it("does not require a team for general organization roles", () => {
    assert.deepEqual(
      getRequiredTeamsForOrganizationRoleList("member,admin"),
      [],
    );
  });
});
