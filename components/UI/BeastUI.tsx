import Beast from "../Beast";
import CardSelector from "./CardSelector";
import { Contexts } from "../States";

interface SelectorProps {
  id: number;
  onSelect: (id: number) => void;
  disabled?: boolean | undefined;
  isMain?: boolean;
}
function Selector(props: SelectorProps) {
  const setting = Contexts.useSetting();

  const list = Beast.getList();
  const filteredList = props.isMain
    ? list
    : list.filter((beast) => beast.id !== setting.mainBeast);

  return (
    <CardSelector
      title="獣神選択"
      list={filteredList}
      src={Beast.getItem(props.id)}
      onSelect={props.onSelect}
      disabled={props.disabled}
    />
  );
}

export default Object.assign(
  {},
  {
    Selector,
  }
);
