"use client";

import jsonChangelog from "@/assets/changelog.json";
import "./Changelog.css";
import Icon from "./Icon";
import { useState } from "react";
import { Button } from "react-bootstrap";

interface JsonLog {
  date: string;
  desc: string;
}
type JsonLogs = JsonLog[];

const LATEST_LOGS_NUMBER = 2;
const MAX_LOGS_NUMBER = 100;

function Changelog() {
  const [expand, setExpand] = useState(false);
  const latestLogs = getLatestLogs(
    jsonChangelog,
    expand ? MAX_LOGS_NUMBER : LATEST_LOGS_NUMBER
  );

  return (
    <>
      <ul className="change-log">
        {latestLogs.map((logObj, index) => (
          <ListItem key={index} logObj={logObj} />
        ))}
      </ul>
      <Button variant="link" onClick={() => setExpand((p) => !p)}>
        {expand ? (
          <>
            折りたたむ
            <span className="ms-1">
              <Icon.CaretUpFill />
            </span>
          </>
        ) : (
          <>
            …続きを見る
            <span className="ms-1">
              <Icon.CaretDownFill />
            </span>
          </>
        )}
      </Button>
    </>
  );
}

function getLatestLogs(src: JsonLogs, logsNum: number) {
  return src.slice(0, logsNum);
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
