import {describe,expect,it} from "vitest";
import {cleanModelText} from "./model-text";

describe("cleanModelText",()=>{
  it("remove a citação Markdown acrescentada pela busca",()=>{
    expect(cleanModelText("Perfil sem dados públicos. ([Garmin](https://connect.garmin.com/profile/x))")).toBe("Perfil sem dados públicos.");
  });

  it("preserva o rótulo útil de um link e remove a URL",()=>{
    expect(cleanModelText("Consulte [a atividade](https://www.strava.com/activities/1)." )).toBe("Consulte a atividade.");
  });
});
