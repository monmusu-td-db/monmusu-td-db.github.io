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

function Changelog() {
  const [logs, setLogs] = useState(LATEST_LOGS_NUMBER);
  const latestLogs = getLatestLogs(jsonChangelog, logs);

  function getToggleButton(count: number) {
    if (logs === count) {
      return count;
    }
    return (
      <Button
        variant="link"
        className="p-0 align-baseline"
        onClick={() => setLogs(count)}
      >
        {count}
      </Button>
    );
  }

  return (
    <>
      <div className="d-flex align-items-end">
        <h2>更新履歴</h2>
        <div className="ms-3 mb-2">
          （{getToggleButton(2)}｜{getToggleButton(20)}｜{getToggleButton(100)}
          ｜{getToggleButton(500)} 件）
        </div>
      </div>
      <ul className="change-log">
        {latestLogs.map((logObj, index) => (
          <ListItem key={index} logObj={logObj} />
        ))}
      </ul>
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
