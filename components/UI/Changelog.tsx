import jsonChangelog from "@/assets/changelog.json";
import "./Changelog.css";

interface JsonLog {
  date: string;
  desc: string;
}
type JsonLogs = JsonLog[];

const ENABLE_LOG_NUMBER = 2;

function Changelog() {
  const latestLogs = getLatestLogs(jsonChangelog);
  return (
    <ul className="change-log">
      {latestLogs.map((logObj, index) => (
        <ListItem key={index} logObj={logObj} />
      ))}
    </ul>
  );
}

function getLatestLogs(src: JsonLogs) {
  return src.slice(0, ENABLE_LOG_NUMBER);
}

function ListItem({ logObj }: { logObj: JsonLog }) {
  return (
    <li>
      <Time date={logObj.date} />
      {logObj.desc}
    </li>
  );
}

function Time({ date }: { date: string }) {
  return <time dateTime={date}>{date}</time>;
}

export default Changelog;
