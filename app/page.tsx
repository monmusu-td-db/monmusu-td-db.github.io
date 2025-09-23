import "./page.css";
import { TablesSituation } from "@/components/UI/Tables";
import PageRoot from "@/components/UI/PageRoot";
import { Col, Container, Row, Table } from "react-bootstrap";
import Icon from "@/components/UI/Icon";
import * as Data from "@/components/Data";
import classNames from "classnames";
import type { ReactNode } from "react";
import Link from "next/link";
import Changelog from "@/components/UI/Changelog";

const getSelector = Data.TableColor.getSelector;

export default function App() {
  return (
    <PageRoot pageType="situation">
      <TablesSituation id="situation" maxRows={100} showIcon />
      <Container className="md-content mt-5">
        <h2>更新履歴</h2>
        <Changelog />
        <h2>このサイトについて</h2>
        <p>
          当サイトでは
          <ExternalLink href="https://monmusu-td.jp/">
            モンスター娘TD
          </ExternalLink>
          のキャラクターの能力値、バフデバフをまとめています。
        </p>
        <h2 id="description">使い方の基本</h2>
        <p>
          <strong>
            右上の歯車アイコン <Icon.GearFill />{" "}
            をクリックしてフィルターを選択することで、合致するキャラクターが表示されます。
            または、検索バー <Icon.Search />{" "}
            に名前等を入力することでも表示することができます。
          </strong>
        </p>
        <p>
          表示される内容はすべてLv150/スキルレベル最大の情報です。
          計算の内容は計算順や丸め誤差等の影響で多少異なることがあります。
          また、攻撃速度に関しては計測のずれによって多少の誤差がある場合がありますので、
          あらかじめご了承ください。
        </p>
        <p>
          表の見出し部分を選択すると内容を並べ替えることができます。
          状態によって以下のように色分けされます。
        </p>
        <ColorDesc color={Data.tableColorAlias.positive}>
          効果量の高い順（優先）
        </ColorDesc>
        <ColorDesc color={Data.tableColorAlias.negative}>
          効果量の低い順（優先）
        </ColorDesc>
        <ColorDesc color={Data.tableColorAlias.positiveWeak}>
          効果量の高い順
        </ColorDesc>
        <ColorDesc color={Data.tableColorAlias.negativeWeak}>
          効果量の低い順
        </ColorDesc>
        <h2>検索バーの仕様</h2>
        <p>検索バーに入力した内容は以下の項目から検索されます。</p>
        <ul>
          <li>ユニットID</li>
          <li>ユニット名</li>
          <li>ユニット略称</li>
          <li>スキル名</li>
          <li>状態</li>
          <li>レアリティ（L/E/R/C）</li>
          <li>属性名（火/水/地/風/光/闇）</li>
          <li>基礎クラス名（ウォリアー、ガーディアンなど）</li>
          <li>クラス名（CC1/CC4/武器種）</li>
          <li>ダメージ属性</li>
          <li>補足</li>
        </ul>
        <p>また、検索する際に正規表現を使用することが可能です。</p>
        <Example>
          <p>
            <b>例：</b>
            <code>スタン耐性|スタン無効</code>と入力すると、
            <b>スタン耐性</b>と<b>スタン無効</b>
            のどちらかが含まれていれば表示されます。
          </p>
        </Example>
        <p>
          詳細は
          <ExternalLink href="https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Regular_expressions/Cheatsheet">
            外部サイトの構文表
          </ExternalLink>
          などをご覧ください。
        </p>
        <h2>補足項目</h2>
        <p>
          補足項目にはデバフ効果や回避、合計ダメージなどが含まれています。
          バフに関しては加算バフ<b>以外</b>は、
          <Link href="./buff">バフページ</Link>
          に表記されているため省略しています。
          ただし例外として状態異常耐性バフについては、
          ユニットの状態異常耐性との一貫性、検索性のため省略していません。
        </p>
        <p>
          また、内容を簡潔にするため短縮構文を多用しています。以下その構文を説明します。
        </p>
        <Example>
          <p>
            <b>例文：</b> ATK-15%(10秒)/発動→射程内
          </p>
          <p className="supplement-legend">
            <b>凡例：</b>
            <u>1. ATK-15%</u>(<u>2. 10秒</u>)/
            <u>3. 発動</u>→<u>4. 射程内</u>
          </p>
        </Example>
        <dl>
          <dt>1. 内容</dt>
          <dd>
            効果の内容でデバフや状態異常耐性など。
            この場合、敵に15%の攻撃力デバフを与える。
          </dd>
          <dt>2. 時間・確率</dt>
          <dd>
            効果時間や確率、補足説明など。 例文ではデバフが10秒間持続する。
            未表記の場合、配置中永続する効果。
          </dd>
          <dt>3. 頻度・発生タイミング</dt>
          <dd>
            効果が有効になるタイミング。
            「発動」ならばEXスキルの発動時、「配置」ならばユニットの配置時、
            「5秒」と表記されていれば5秒ごとに有効になる。
            未表記の場合、常時発動する効果。
          </dd>
          <dt>4. 対象</dt>
          <dd>
            効果対象。
            「命中」ならば攻撃や回復のヒット時、「射程内」なら射程内の敵もしくは味方。
            特記なき場合バフ効果は味方のみ、デバフ効果は敵にのみ対象となる。
            未表記の場合、自身のみ対象の効果。
          </dd>
        </dl>
        <h3>補足項目の略語</h3>
        <dl>
          <dt>ATK</dt>
          <dd>攻撃力</dd>
          <dt>DEF</dt>
          <dd>物理防御</dd>
          <dt>RES</dt>
          <dd>魔法防御</dd>
          <dt>tkn</dt>
          <dd>トークン</dd>
          <dt>鈍足</dt>
          <dd>移動速度減少</dd>
          <dt>dmg</dt>
          <dd>ダメージ</dd>
          <dt>ACT</dt>
          <dd>クラスアクション</dd>
          <dt>CT</dt>
          <dd>EXスキル再発動待機時間</dd>
          <dt>limit</dt>
          <dd>トークン持続時間</dd>
          <dt>ノックバック</dt>
          <dd>敵を後退させる効果</dd>
        </dl>
        <h2>ツールチップ</h2>
        <p>一部の項目をタップ、もしくはホバーすると詳細情報が表示されます。</p>
        <h3>ユニット名ツールチップ</h3>
        <p>主に表に収まりきらない雑多な情報が含まれています。</p>
        <p>以下、使用されている単語を説明します。</p>
        <h4>移動タイプ</h4>
        <dl>
          <dt>{Data.MoveType.normal}</dt>
          <dd>通常の移動タイプ。</dd>
          <dt>{Data.MoveType.charging}</dt>
          <dd>突進して移動し、敵とすれ違う際に立ち止まらず攻撃する。</dd>
          <dt>{Data.MoveType.flying}</dt>
          <dd>飛行して移動。</dd>
          <dt>{Data.MoveType.warping}</dt>
          <dd>ワープして移動。</dd>
          <dt>{Data.MoveType.stealth}</dt>
          <dd>移動中攻撃を行わず、移動中敵の遠距離攻撃の対象にならない。</dd>
        </dl>
        <h4>配置タイプ</h4>
        <dl>
          <dt>{Data.Placement.desc.vanguard}</dt>
          <dd>近接マスもしくはALLマスに配置可能。</dd>
          <dt>{Data.Placement.desc.rearguard}</dt>
          <dd>遠距離マスもしくはALLマスに配置可能。</dd>
          <dt>{Data.Placement.desc.omniguard}</dt>
          <dd>近接、遠距離、ALLすべてのマスに配置可能。</dd>
          <dt>{Data.Placement.desc.servant}</dt>
          <dd>ユニットのそばに配置される付与トークン。</dd>
          <dt>{Data.Placement.desc.target}</dt>
          <dd>獣神召喚のように自由位置に配置可能なトークン。</dd>
        </dl>
        <h3>基礎能力値ツールチップ</h3>
        <p>
          HP、攻撃力、物理防御、魔法防御、射程のツールチップで使われている単語です。
        </p>
        <dl>
          <dt>出撃前能力</dt>
          <dd>
            出撃前のキャラクター画面で表示されている能力値。
            基礎値に加えて、設定に応じて潜在覚醒、専用武器、サブスキルなどが適用されている。
          </dd>
          <dt>配置前能力</dt>
          <dd>
            配置前にキャラクターをつかんだ際に表示される能力値。
            出撃前能力に編成バフ、獣神バフ、獣神効果、タイプボーナスなどが適用される。
          </dd>
          <dt>戦闘中能力</dt>
          <dd>
            戦闘中にキャラクターを選択した際に表示される能力値。
            配置前能力に乗算バフや加算バフが適用された値が表示される。
          </dd>
          <dt>実攻撃力</dt>
          <dd>戦闘中能力値にダメージ倍率を適用した値。</dd>
          <dt>
            <small>(CRI率)</small>CRI攻撃力
          </dt>
          <dd>
            戦闘中能力値にダメージ倍率とクリティカルダメージ倍率を適用した値。
            先頭のカッコの中身はクリティカル率を表す。
          </dd>
          <dt>固有値</dt>
          <dd>実際の能力値とは異なる値を表す。</dd>
          <dd>
            <Example>
              <p>
                <b>例：</b>リジェネ回復量、生命力吸収回復量、加算バフ効果など
              </p>
            </Example>
          </dd>
        </dl>
        <h3>攻撃間隔</h3>
        <dl>
          <dt>攻撃動作速度</dt>
          <dd>攻撃のモーション部分のフレーム数。</dd>
          <dt>攻撃待機時間</dt>
          <dd>攻撃後の硬直時間のフレーム数。</dd>
          <dt>攻撃間隔</dt>
          <dd>
            攻撃動作速度と攻撃待機時間を加算した、攻撃一回当たりにかかるフレーム数。
          </dd>
          <dt>単発スキル発動間隔</dt>
          <dd>
            曲刀クラスのEXスキルのように、持続時間が短いスキルの発動する間隔。
          </dd>
        </dl>
        <h3>物理・魔法ワンパン</h3>
        <dl>
          <dt>耐久値</dt>
          <dd>
            一撃で撃破される敵攻撃力。
            この値から1を引いた攻撃力までは耐えられる。
          </dd>
          <dd>
            なお敵に割合デバフを与える場合、
            敵の基礎攻撃力とバフ量に応じてデバフ量が変化するが、
            ここの表示では敵のバフやデバフは考慮していないので注意。
          </dd>
          <dt>攻撃回避率</dt>
          <dd>ユニットの物理もしくは魔法攻撃回避率。</dd>
        </dl>
        <h2>表の色分け・強調表示</h2>
        <p>一部の項目は状況に応じて表示が変化します。</p>
        <p>色分けの意味合いは以下の通りです。</p>
        <ColorDesc color={Data.tableColorAlias.positiveWeak}>
          特定の状況時上昇
        </ColorDesc>
        <ColorDesc color={Data.tableColorAlias.positive}>
          スキル発動時上昇
        </ColorDesc>
        <ColorDesc color={Data.tableColorAlias.positiveStrong}>
          バフスキル発動時上昇
        </ColorDesc>
        <ColorDesc color={Data.tableColorAlias.negativeWeak}>
          特定の状況時減少
        </ColorDesc>
        <ColorDesc color={Data.tableColorAlias.negative}>
          スキル発動時減少
        </ColorDesc>
        <ColorDesc color={Data.tableColorAlias.negativeStrong}>
          バフスキル発動時減少
        </ColorDesc>
        <ColorDesc color={Data.tableColorAlias.warning}>特殊な状態</ColorDesc>
        <h3>回復不能効果</h3>
        <p>
          HP、物理ワンパン、魔法ワンパンの項目にある<u>下線</u>は、
          通常の方法では回復できないことを表す。
        </p>
        <h3>確定クリティカル</h3>
        <p>
          クリティカル率が100%になる場合、攻撃力の項目が<b>太字</b>
          で表示される。
        </p>
        <h3>DPS・ワンパン値の色分け</h3>
        <Table bordered size="sm" className="color-desc-table">
          <tbody>
            <tr>
              <th className={getSelector(Data.damageTypeColor.physic)}>
                {Data.damageType.physic}
              </th>
              <LinesCell lines={Data.TableColor.dpsPhysicalLines} />
            </tr>
            <tr>
              <th className={getSelector(Data.damageTypeColor.magic)}>
                {Data.damageType.magic}
              </th>
              <LinesCell lines={Data.TableColor.dpsMagicalLines} />
            </tr>
            <tr>
              <th className={getSelector(Data.damageTypeColor.true)}>
                {Data.damageType.true}
              </th>
              <LinesCell lines={Data.TableColor.dpsTrueDamageLines} />
            </tr>
            <tr>
              <th className={getSelector(Data.damageTypeColor.heal)}>
                {Data.damageType.heal}
              </th>
              <LinesCell lines={Data.TableColor.dpsHealLines} />
              <td></td>
            </tr>
          </tbody>
        </Table>
        <Table bordered size="sm" className="color-desc-table">
          <tbody>
            <tr>
              <th className={getSelector(Data.damageTypeColor.physic)}>
                {Data.StatType.nameOf(Data.stat.physicalLimit)}
              </th>
              <LinesCell lines={Data.TableColor.limitPhysicalLines} />
            </tr>
            <tr>
              <th className={getSelector(Data.damageTypeColor.magic)}>
                {Data.StatType.nameOf(Data.stat.magicalLimit)}
              </th>
              <LinesCell lines={Data.TableColor.limitMagicalLines} />
            </tr>
          </tbody>
        </Table>
        <h2>サブスキル設定の仕様</h2>
        <p>一部の効果は表に反映されません。具体的には以下の効果です。</p>
        <ul>
          <li>リジェネ</li>
          <li>生命力吸収</li>
          <li>回復効果</li>
          <li>トークン使役</li>
          <li>自爆ダメージ</li>
          <li>反射ダメージ</li>
          <li>反動ダメージ</li>
          <li>状態異常耐性変動</li>
          <li>再出撃時間短縮</li>
          <li>撤退時コスト回復量増加</li>
          <li>バリア</li>
          <li>マス属性変化</li>
          <li>行動を制限する効果（寝正月など）</li>
        </ul>
        <p>
          表に反映されない効果のみのサブスキルは標準で非表示になっています。
        </p>
        <p>また、以下の限定条件は反映されず、常に最大値が適用されます。</p>
        <ul>
          <li>HPが一定量以下</li>
          <li>敵撃破数に応じて効果上昇</li>
          <li>クリティカル発生数に応じて効果上昇</li>
          <li>時限効果</li>
          <li>特定の状態異常の敵に対して効果上昇</li>
        </ul>
        <h2>その他</h2>
        <p>入力欄の隣にある領域を押すと、入力欄の内容がリセットされます。</p>
        <p>
          属性マスの効果は自前で属性変化可能なユニットに関しては別途表記していますが、
          そのほかのユニットでは表記していません。
        </p>
      </Container>
    </PageRoot>
  );
}

function ColorDesc({
  color,
  children,
}: {
  color: Data.TableColor | undefined;
  children: ReactNode;
}) {
  return (
    <Row className="ms-0 mb-1">
      <Col className={classNames("color-desc", getSelector(color))} />
      <Col>{children}</Col>
    </Row>
  );
}

function LinesCell({ lines }: { lines: Data.TableColorLines }): ReactNode {
  return lines.map((line, i) => {
    const className = getSelector(line[1]);
    return (
      <td key={line[0]} className={className}>
        {i === lines.length - 1 ? (
          <>{lines[lines.length - 2]![0]}以上</>
        ) : (
          <>{line[0]}未満</>
        )}
      </td>
    );
  });
}

function Example({ children }: { children: ReactNode }) {
  return <div className="border rounded ps-2 pt-2 mb-2">{children}</div>;
}

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a href={href} className="ex-link">
      {children}
      <Icon.BoxArrowUpRight width={14} height={14} />
    </a>
  );
}
