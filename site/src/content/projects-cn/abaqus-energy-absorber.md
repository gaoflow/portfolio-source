---
title: '我们怎样用 Abaqus 做汽车前纵梁碰撞分析'
year: 2026
date: '2026-03-28'
status: complete
categories: [design, validation]
tags: [有限元分析]
summary: '我们从一根课程给定的前纵梁出发，先学会读懂冲击曲线，再比较材料、冲击工况和截面厚度。结果里既有跑不起来的模型，也有看似吸能很好、却太重或峰值力太高的方案。'
role: '共同建模、结果分析与报告撰写'
team: '四人课程项目'
duration: '6 周'
academic:
  institution: 'ESILV'
  course: '计算固体力学'
  assignment: '汽车吸能器的动态冲击与形状探索'
  note: '这是一个四人合作的计算固体力学课程项目。我们用 Abaqus/Explicit 比较材料、冲击工况和截面设计。'
  requirements:
    - '模拟汽车前纵梁的动态冲击。'
    - '参考 CRASH-UNIT09-W06-CurvedBeam.pdf 中的建模与结果检查方法。'
    - '以课程提供的 energy absorber.stp 几何为起点。'
    - '绘制力–位移曲线。'
    - '尝试不同形状，可参考 Fang 等人的 FGT 论文或 CRASH-UNIT06-W02-RailCrush.pdf。'
  media: []
featured: false
order: 18
studySequence: 10
heroImage: /images/projects/abaqus-energy-absorber/assignment-front-rail.jpeg
---

## 一根前纵梁，要解决什么

正面碰撞时，前纵梁会先被压弯、起皱，再一层层折起来。金属从原来的形状变成回不去的形状，车的运动能量也就有一部分变成了永久变形。项目说明把前纵梁看作正碰中承担大约一半动能的部件；这个比例只是课程里的背景，不是所有车型都通用的定律。

老师给我们的任务很开放，只有五件事：模拟前纵梁的动态冲击；参考曲梁案例学习建模和看结果；从给定的 STEP 几何开始；画出力–位移曲线；最后再尝试不同形状。材料、速度、冲击体质量、网格和要做几个方案都没有写死，这些要靠我们自己决定。

页首白车身图片中的红色区域就是前纵梁。

我们想回答的问题也很直接：怎样让纵梁持续折叠，把更多动能吃进去，同时别在撞上的第一下产生太高的力？这三个目标彼此会打架：

- 比吸收能 $SEA=E/M$ 越高，说明每千克结构吸收的能量越多；
- 峰值压溃力 $F_{max}$ 越低，第一次冲击越温和；
- 碰撞力效率 $CFE=F_{mean}/F_{max}$ 越高，说明后面的压溃平台越接近恒定。

高 CFE 只代表“平台平”，不代表“力小”。如果平均力和峰值力都很高，曲线可以很平，乘员载荷仍然可能很大。

要比较这三个指标，得先把尺寸、质量和能量单位统一。否则同一张曲线也可能读出不同结论。

## 先把模型尺度统一

课程给的纵梁长 1000 mm。基准帽形截面宽 100 mm，内部跨度 59 mm，总高 51.2 mm，翼缘宽 20.5 mm；帽形件厚 1.2 mm，封板厚 0.8 mm。后面把它们都改成 1.0 mm，或者把角部加厚，都是从这个基准变化出来的。

<figure>
  <img src="/images/projects/abaqus-energy-absorber/baseline-geometry-dimensions.png" alt="基准纵梁的长度、截面尺寸和 1.2/0.8 毫米板厚" loading="lazy">
  <figcaption>基准尺寸</figcaption>
</figure>

模型采用 mm–tonne–s 单位制。长度用 mm，力用 N，质量用 tonne，时间用 s，应力用 MPa。这个单位制最容易在能量上看错：Abaqus 输出的是 N·mm，不是 J。

| 量 | 单位 |
|---|---|
| 长度 | mm |
| 力 | N |
| 质量 | tonne |
| 时间 | s |
| 应力 | MPa，也就是 N/mm² |
| 能量 | N·mm |

$$
1\times10^6\ \text{N·mm}=1\ \text{kJ}.
$$

力–位移曲线下面的面积就是做功：

$$
W=\int F\,dx.
$$

所以图上 $3.5\times10^6$ N·mm 要读成 3.5 kJ，不能写成 $3.5\times10^6$ J。

尺寸和单位对上以后，我们开始跑第一轮模型，很快就碰到了属性缺失。

## 第一轮：V1 报错，我们也学会了怎么看曲线

### 模型目录里的 V1：328 个单元没有属性

模型文件里的 V1 有 328 个单元没有分配材料或截面属性。Abaqus 在输入检查时就停了，后面没有可用的冲击过程。这次失败很基础，却很有用：模型树里有零件、有网格、有作业，不代表求解真的开始了。以后每次提交前，我们都会先检查 section assignment 有没有漏掉单元。

模型目录里的 V1 停在输入检查；报告里还有一组同样标成 V1 的 50 km/h 曲线。下面把后者叫作“早期基线”，只用它说明我们当时怎样读冲击结果。

### 报告里的早期基线

早期基线的速度是 13,888 mm/s，也就是约 50 km/h。

<figure>
  <img src="/images/projects/abaqus-energy-absorber/early-baseline-energy.png" alt="早期基线在 0.02 秒内的动能和内能变化" loading="lazy">
  <figcaption>能量</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/early-baseline-displacement.png" alt="早期基线冲击体位移随时间近似线性下降" loading="lazy">
  <figcaption>位移</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/early-baseline-reaction-force.png" alt="早期基线支座反力在接触后快速上升并伴随振荡" loading="lazy">
  <figcaption>反力</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/early-baseline-force-displacement-raw.png" alt="早期基线未经平滑的力位移曲线" loading="lazy">
  <figcaption>原始力–位移</figcaption>
</figure>

前 0.005 s，冲击体还没有压上纵梁，所以反力接近零。接触后先出现约 100 kN 的尖峰，随后纵梁继续折叠，反力一边振荡一边上升，在 0.0199 s 左右达到 137.6 kN。冲击体在 0.02 s 内走了约 270 mm，位移几乎是直线，说明这段时间里速度还没有明显降下来。

原始力曲线有很多高频锯齿。显式求解、接触、应力波和质量缩放都会把这种振荡带进结果。我们保留原始图看瞬间峰值，再用平滑图看整体平台，不能只挑一条更好看的曲线。

<figure>
  <img src="/images/projects/abaqus-energy-absorber/force-displacement-preliminary.png" alt="早期基线经过平滑后的力位移曲线" loading="lazy">
  <figcaption>平滑力–位移</figcaption>
</figure>

把漏掉的截面属性补齐后，V2 才给出了可以并排比较的材料结果。

## 第二轮：用 V2 看材料

V2 把模型补齐到 393 个 C3D8R 单元和 902 个节点，速度仍是 13,888 mm/s，分析时间延长到 0.04 s，接触摩擦系数为 0.3。四个作业都显示完成，但其中一个名为 HLE 的作业仍然调用铝材料，所以它不是高强钢结果，我们没有把它放进比较。

先看钢。冲击体在 0.04 s 内移动约 500 mm，反力升到约 190 kN；动能下降时，内能随之上升。

<figure>
  <img src="/images/projects/abaqus-energy-absorber/steel-displacement-history.png" alt="V2 钢模型冲击体位移随时间变化" loading="lazy">
  <figcaption>钢：位移</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/steel-reaction-force-history.png" alt="V2 钢模型反力随时间上升至约 190 千牛" loading="lazy">
  <figcaption>钢：反力</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/steel-energy-history.png" alt="V2 钢模型动能下降和内能上升的能量曲线" loading="lazy">
  <figcaption>钢：能量</figcaption>
</figure>

铝的峰值低一些，大约 115 kN。图里的应力集中在弯曲和折叠区域，这正是薄壁件靠局部屈曲吸能的地方。

<figure>
  <img src="/images/projects/abaqus-energy-absorber/aluminium-displacement-history.png" alt="V2 铝模型冲击体位移随时间变化" loading="lazy">
  <figcaption>铝：位移</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/aluminium-reaction-force-history.png" alt="V2 铝模型反力在接触后形成约 100 千牛的平台" loading="lazy">
  <figcaption>铝：反力</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/aluminium-energy-numerical-quality.png" alt="V2 铝模型人工能量和内能曲线" loading="lazy">
  <figcaption>铝：人工能量</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/aluminium-energy-history.png" alt="V2 铝模型动能、内能和人工能量曲线" loading="lazy">
  <figcaption>铝：总能量</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/aluminium-mises-impact.png" alt="V2 铝纵梁弯曲后的 Mises 应力分布" loading="lazy">
  <figcaption>铝：Mises 应力</figcaption>
</figure>

把钢和铝画到同一张力–位移图上，钢的峰值约 190 kN，铝约 115 kN。曲线积分得到的做功大约是 58 和 46 kJ。钢的密度是 7850 kg/m³，铝是 2500 kg/m³；如果几何体积相同，用密度把质量换算进去，铝的 SEA 约为钢的 2.48 倍。钢吃掉的绝对能量更多，铝则用更少的质量完成了相当一部分工作。

<figure>
  <img src="/images/projects/abaqus-energy-absorber/steel-aluminium-force-comparison.png" alt="V2 钢与铝的力位移曲线叠加比较" loading="lazy">
  <figcaption>钢 / 铝</figcaption>
</figure>

这些数字只能拿来找方向，不能当成精确排名。部分能量图读出的数值和力–位移积分并不完全一致。V2 还使用了固定质量缩放系数 100，增加质量约 9900%；铝模型末期 $ALLAE/ALLIE\approx15\%$，人工能量已经不小。镁的反力平台大约 70 kN，也只是探索结果。要认真比较材料，必须把几何、网格、速度和冲击体都固定下来，并去掉这种过强的质量缩放。

这组结果给了我们一个方向，但数值质量还不够好。我们又换成 500 kg 刚性冲击体，看看同样的材料差异会不会再次出现。

### 换成 500 kg 冲击体再看一次

我们还做了一组单独的壁面冲击。它用 500 kg 刚性冲击体，以 50 km/h 撞击吸能器，材料包括钢、Al 6061、Ti-6Al-4V 和聚丙烯。这组模型的质量、边界和行程与 V2、V3、A/B/D 截面比较都不同，所以数字不能混成一张总榜。

<figure>
  <img src="/images/projects/abaqus-energy-absorber/wall-impact-aluminium.png" alt="500 千克冲击体工况下铝纵梁的 Mises 应力结果" loading="lazy">
  <figcaption>Al 6061</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/wall-impact-polypropylene.png" alt="500 千克冲击体工况下聚丙烯纵梁的冲击结果" loading="lazy">
  <figcaption>聚丙烯</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/wall-impact-steel.png" alt="500 千克冲击体工况下钢纵梁的 Mises 应力结果" loading="lazy">
  <figcaption>钢</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/wall-impact-titanium.png" alt="500 千克冲击体工况下钛合金纵梁的冲击结果" loading="lazy">
  <figcaption>Ti-6Al-4V</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/wall-impact-force-displacement.png" alt="钢、钛合金和铝在 500 千克冲击体工况下的力位移曲线" loading="lazy">
  <figcaption>力–位移</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/wall-impact-energy-comparison.png" alt="钢、钛合金和铝在 500 千克冲击体工况下的能量曲线" loading="lazy">
  <figcaption>能量</figcaption>
</figure>

<div class="not-prose my-8 overflow-x-auto" style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
  <table class="min-w-[720px] w-full border-collapse text-sm" style="min-width:720px;width:100%;border-collapse:collapse;">
    <thead>
      <tr class="border-b border-edge text-left">
        <th class="px-3 py-2">材料</th>
        <th class="px-3 py-2">质量（kg）</th>
        <th class="px-3 py-2">峰值力（kN）</th>
        <th class="px-3 py-2">CFE</th>
        <th class="px-3 py-2">SEA（kJ/kg）</th>
        <th class="px-3 py-2">行程（mm）</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b border-edge-soft"><td class="px-3 py-2">钢</td><td class="px-3 py-2">2.73</td><td class="px-3 py-2">185</td><td class="px-3 py-2">95.2%</td><td class="px-3 py-2">17.3</td><td class="px-3 py-2">268</td></tr>
      <tr class="border-b border-edge-soft"><td class="px-3 py-2">Al 6061</td><td class="px-3 py-2">0.94</td><td class="px-3 py-2">102</td><td class="px-3 py-2">60.5%</td><td class="px-3 py-2">50.8</td><td class="px-3 py-2">774</td></tr>
      <tr><td class="px-3 py-2">Ti-6Al-4V</td><td class="px-3 py-2">1.54</td><td class="px-3 py-2">249</td><td class="px-3 py-2">92.5%</td><td class="px-3 py-2">27.9</td><td class="px-3 py-2">186</td></tr>
    </tbody>
  </table>
</div>

聚丙烯出现接触不稳定，力曲线不可信，所以没有放进表里。Al 6061 的峰值力最低，SEA 最高，但它需要 774 mm 的行程，几乎是钢的三倍。车头如果放不下这么长的压溃空间，再高的 SEA 也解决不了布置问题。钛合金和钢的平台更平，却伴随更高的力。所以在这组结果里，不能只挑某一列最大的数字。

两组材料试验都说明，只看峰值力或 SEA 很容易下错结论。我们先停下材料排名，重新跑一个设置更干净的 30 km/h 工况。

## 第三轮：把 30 km/h 工况跑完

V3 回到 30 km/h 工况。帽形纵梁和封板都设为 1 mm，两部分用 Tie 连在一起；接触使用 general contact，摩擦系数 0.3。模型有 405 个可变形单元、961 个节点，刚性壁质量为 1.0 tonne，也就是 1000 kg，初速度为 8333 mm/s，分析时间 0.06 s。V3 没有使用固定质量缩放，作业能够跑完。

<figure>
  <video controls playsinline muted loop preload="metadata" style="display:block;width:100%;height:auto;">
    <source src="/images/projects/abaqus-energy-absorber/v3-crash-result.mp4" type="video/mp4">
    你的浏览器不支持 HTML5 视频。
  </video>
  <figcaption>V3 冲击</figcaption>
</figure>

初始总能量约 34.72 kJ，结束时约 34.70 kJ，总量几乎没有漂走。最终动能还剩 22.65 kJ，因此约 12.07 kJ 动能转进了其他能量项。这里不能顺手把 12.07 kJ 全叫作塑性吸能：要回答能量究竟去了哪里，还得从 ODB 逐项查看内能、人工能量、接触能和其他分量。

V3 也留下了数值问题。求解超过 300,000 个增量，Abaqus 建议用双精度重跑。它比 V2 少了激进的质量缩放，但我们仍然没有做网格收敛，不能因为总能量守恒就认为每一项结果都已经足够准确。

V3 能跑完以后，问题从“模型能不能算完”转到“有限的材料应该放在哪里”。

## 第四轮：从换材料转到改截面

### 为什么想到 FGT

均匀加厚最省事，但薄壁件不是每个位置都同样重要。折叠通常从角部和筋板连接处开始，那里会形成塑性铰。FGT 的想法是把更多材料放在这些位置，把平直、受力较弱的壁面做薄，让局部屈曲按预期顺序发展。

<figure>
  <img src="/images/projects/abaqus-energy-absorber/fgt-regions-theory.png" alt="FGT 多胞截面中 Region I、II、III 和连续厚度参数示意" loading="lazy">
  <figcaption>FGT 分区</figcaption>
</figure>

论文把截面分成三类区域：Region I 是角部单元的外壁，Region II 是角部之间的连接外壁，Region III 是内部筋板。理论上，厚度可以从角部的 $t_{max}$ 连续过渡到平壁的 $t_{min}$：

$$
t(s)=t_{min}+\left(t_{max}-t_{min}\right)\left(1-\frac{s}{H}\right)^{n_i}.
$$

$s$ 表示沿截面走了多远，$H$ 是这段壁面的长度，$n_i$ 决定厚度降得快还是慢。这个写法的重点不是把整根纵梁一起加厚，而是在总质量不变的理想条件下，把材料挪到更需要它的地方。

### 实际做的是分段厚度

论文里的 FGT 是连续厚度设计。我们在 Abaqus 里做的是简化版本：角部 2 mm，壁面 1 mm。我们没有完成连续厚度函数的实现，也没有在固定质量约束下做参数搜索。因此，Model D 是受 FGT 启发的分段厚度多胞截面。

这是答辩中使用的原始 FGT 结果动画。播放时，中部弯折位置继续变形，Mises 应力颜色从蓝色逐渐向绿色、橙色和红色移动。

<figure>
  <video controls playsinline muted loop autoplay preload="metadata" style="display:block;width:100%;height:auto;">
    <source src="/images/projects/abaqus-energy-absorber/fgt-model-d-deformation.mp4" type="video/mp4">
    你的浏览器不支持 HTML5 视频。
  </video>
  <figcaption>FGT：变形</figcaption>
</figure>

### 比较 A、B 和 D

这组几何比较都看 0.06 s 时的结果。Model A 保留 1.2/0.8 mm 的基准厚度；Model B 把所有壁厚统一成 1.0 mm；Model D 用多胞截面，并把角部设为 2 mm、壁面设为 1 mm。还有一个统一 2 mm 的 Model C，但它没有可用的最终结果，所以不参加下面的比较。

<div class="not-prose my-8 overflow-x-auto" style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
  <table class="min-w-[820px] w-full border-collapse text-sm" style="min-width:820px;width:100%;border-collapse:collapse;">
    <thead>
      <tr class="border-b border-edge text-left">
        <th class="px-3 py-2">指标</th>
        <th class="px-3 py-2">Model A：1.2/0.8 mm</th>
        <th class="px-3 py-2">Model B：统一 1.0 mm</th>
        <th class="px-3 py-2">Model D：角部 2 mm、壁面 1 mm</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b border-edge-soft"><td class="px-3 py-2">质量（kg）</td><td class="px-3 py-2">0.727</td><td class="px-3 py-2">0.683</td><td class="px-3 py-2">3.397</td></tr>
      <tr class="border-b border-edge-soft"><td class="px-3 py-2">ALLIE（kJ）</td><td class="px-3 py-2">3.5</td><td class="px-3 py-2">2.8</td><td class="px-3 py-2">33.0</td></tr>
      <tr class="border-b border-edge-soft"><td class="px-3 py-2">剩余动能（kJ）</td><td class="px-3 py-2">31.0</td><td class="px-3 py-2">32.0</td><td class="px-3 py-2">0.5</td></tr>
      <tr class="border-b border-edge-soft"><td class="px-3 py-2">ALLAE/ALLIE</td><td class="px-3 py-2">&lt;1%</td><td class="px-3 py-2">&lt;1%</td><td class="px-3 py-2">&lt;1%</td></tr>
      <tr class="border-b border-edge-soft"><td class="px-3 py-2">SEA（kJ/kg）</td><td class="px-3 py-2">4.81</td><td class="px-3 py-2">4.09</td><td class="px-3 py-2">9.71</td></tr>
      <tr class="border-b border-edge-soft"><td class="px-3 py-2">峰值力（kN）</td><td class="px-3 py-2">32.0</td><td class="px-3 py-2">32.5</td><td class="px-3 py-2">280</td></tr>
      <tr class="border-b border-edge-soft"><td class="px-3 py-2">平均力（kN）</td><td class="px-3 py-2">11.6</td><td class="px-3 py-2">7.7</td><td class="px-3 py-2">264</td></tr>
      <tr class="border-b border-edge-soft"><td class="px-3 py-2">CFE</td><td class="px-3 py-2">36.2%</td><td class="px-3 py-2">23.7%</td><td class="px-3 py-2">94.3%</td></tr>
      <tr><td class="px-3 py-2">最大位移（mm）</td><td class="px-3 py-2">300</td><td class="px-3 py-2">360</td><td class="px-3 py-2">125</td></tr>
    </tbody>
  </table>
</div>

#### Model A：基准件还能继续走很远

<figure>
  <img src="/images/projects/abaqus-energy-absorber/model-a-energy-history.png" alt="Model A 在 0.06 秒内的动能、内能和人工能量" loading="lazy">
  <figcaption>A：能量</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/model-a-force-history.png" alt="Model A 接触后的反力随时间变化" loading="lazy">
  <figcaption>A：反力</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/model-a-displacement-history.png" alt="Model A 在约 0.025 秒接触后达到 300 毫米位移" loading="lazy">
  <figcaption>A：位移</figcaption>
</figure>

Model A 的内能到 3.5 kJ，平均力 11.6 kN，峰值 32 kN，走了 300 mm 后仍剩 31 kJ 动能。它建立了一个不算强、但容易理解的基准。

#### Model B：把厚度统一成 1.0 mm

<figure>
  <img src="/images/projects/abaqus-energy-absorber/model-b-energy-history.png" alt="Model B 在 0.06 秒内的动能、内能和人工能量" loading="lazy">
  <figcaption>B：能量</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/model-b-force-history.png" alt="Model B 接触后的反力随时间变化" loading="lazy">
  <figcaption>B：反力</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/model-b-displacement-history.png" alt="Model B 在约 0.025 秒接触后达到 360 毫米位移" loading="lazy">
  <figcaption>B：位移</figcaption>
</figure>

从 A 改成 B，质量只减少 6.1%，但 ALLIE 下降 20%，SEA 下降 15%，平均力下降 33.6%，CFE 少了 12.5 个百分点，行程反而增加 20%。这不能说明 1 mm 厚度本身一定不好。更可能的解释是，板厚重新分配后，折叠起点也跟着变了。

#### Model D：角部加厚的多胞截面

<figure>
  <img src="/images/projects/abaqus-energy-absorber/model-d-energy-history.png" alt="Model D 的动能快速转成内能并在末期接近停止" loading="lazy">
  <figcaption>D：能量</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/model-d-force-history.png" alt="Model D 在接触后形成约 264 千牛的高反力平台" loading="lazy">
  <figcaption>D：反力</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/model-d-displacement-history.png" alt="Model D 在冲击中达到约 125 毫米位移" loading="lazy">
  <figcaption>D：位移</figcaption>
</figure>

从 A 改到 D，质量变成 4.67 倍，ALLIE 变成 9.43 倍，SEA 变成 2.02 倍；同时峰值力变成 8.75 倍，平均力约变成 22.8 倍，行程缩短约 58%。D 的 94.3% CFE 确实说明平台很平，可这个平台在 264 kN 左右，峰值达到 280 kN。对吸能器来说，“持续用很大的力压溃”和“持续用合适的力压溃”不是一回事。

所以我们没有把 D 当作最优方案。它能在较短行程里吃掉更多动能，但代价是质量和载荷都大幅增加。要知道厚度分配本身有没有价值，下一轮必须让不同截面使用相同的质量预算。

## 最后能确定什么

回到开头的三个指标，SEA、峰值力和 CFE 必须一起看。铝在两组材料工况里都显示出较高的质量效率，但 774 mm 的行程会带来布置问题。Model B 提醒我们，统一板厚以后，折叠起点可能随之变化。Model D 的 SEA 和 CFE 都更高，可它的质量是 A 的 4.67 倍，平均力也达到 264 kN。高而平的压溃平台不等于合适的乘员载荷。

下一轮会统一速度、冲击体、可用行程和结构质量，再比较材料与截面；用多套网格检查结果是否收敛；从 ODB 重新核对每一项能量；用双精度重跑 V3；并移除 V2 的固定质量缩放。完成这些计算后，峰值力、SEA 和 CFE 才能在相同条件下比较。
