import Beast from "./Beast";
import CardSelector from "./CardSelector";

interface SelectorProps {
  id: number
  onSelect: (id: number) => void
  disabled?: boolean | undefined
}
function Selector(props: SelectorProps) {
  return (
    <CardSelector
      title="獣神選択"
      list={Beast.getList()}
      src={Beast.getItem(props.id)}
      onSelect={props.onSelect}
      disabled={props.disabled}
    />
  );
}

export default Object.assign({}, {
  Selector
});
