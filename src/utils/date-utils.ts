import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export function getNextUtc4AM() {
  const now = dayjs().utc();
  const next4AM =
    now.hour() < 4
      ? now.hour(4).minute(0).second(0)
      : now.add(1, "day").hour(4).minute(0).second(0);
  return next4AM;
}
