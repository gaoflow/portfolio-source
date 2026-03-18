---
title: '在 3DExperience 上用 GSD 建模 F1 2026 真车'
year: 2026
date: '2026-08-24'
status: active
categories: [design]
tags: [设计, CAD, GSD, 曲面建模]
summary: '我在 3DExperience 的 Generative Shape Design 中，通过建立点、截面、样条、放样以及裁剪曲面，成功完成了 F1 2026 侧箱和后翼的还原，并打算后续绘制出 F1 2026 赛车的整车。'
role: '独立 CAD 曲面建模'
duration: '侧箱与后翼完成 · 整车曲面建模进行中'
featured: true
order: 0
studySequence: 19
heroImage: /images/projects/3dexperience-rb22/sidepod/sidepod_r1_iso.jpg
---

在亲身去参观了一场 F1 的比赛，并且近距离看到了 F1 2026 的 1:1 真车模型之后，我便有了在 3DExperience 上重建 F1 2026 赛车的打算。

<div class="not-prose my-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
  <img src="/images/projects/3dexperience-rb22/f1-photos/IMG_4739.jpg" alt="真车模型的前侧三分之四视图" class="aspect-[3/2] h-full w-full rounded-lg object-cover" decoding="async" />
  <img src="/images/projects/3dexperience-rb22/f1-photos/IMG_4753.jpg" alt="真车模型的正面与前翼" class="aspect-[3/2] h-full w-full rounded-lg object-cover" decoding="async" />
  <img src="/images/projects/3dexperience-rb22/f1-photos/IMG_4756.jpg" alt="真车模型的侧箱与座舱区域" class="aspect-[3/2] h-full w-full rounded-lg object-cover" loading="lazy" decoding="async" />
  <img src="/images/projects/3dexperience-rb22/f1-photos/IMG_4765.jpg" alt="真车模型的后翼与后部车身" class="aspect-[3/2] h-full w-full rounded-lg object-cover" loading="lazy" decoding="async" />
</div>

## 参考

我自己的项目参考了 Ted L 的文章 [《I Built an F1 Car — The 2026 Regulations》](https://www.linkedin.com/pulse/i-built-f1-car-2026-regulations-ted-l-dqfnc/)。这是一篇非常有深度的文章，我从中学到了很多。原文从整车的角度记录了作者如何根据 2026 新规进行几何创建、法规取舍和 CFD 分析。

我也大致遵循了这篇文章的思路，我打算先把整车拆成明确的部件，并逐个完成每个部件的建模，最后再进行 CFD 分析，用来验证自己的建模与真车之间的差距。

首先，我将侧箱作为第一个研究目标。在一个空白项目中，我从头建立了点、曲面、截面曲线、支撑面和结构曲面，随后又用同样的方法完成了后翼的绘制。

## 从零建立建模骨架的思路

首先，我建立了车辆中心面和一组沿车身纵向分布的基准平面，并由中心面控制左右对称。

纵向平面承载侧箱的截面（后续绘制后翼时也采用了同样的方法）。水平和横向平面则用于确定底部高度、端板位置，以及各个曲面之间的空间关系。

由于车身是对称结构，因此在建模阶段我只需要完成其中一侧，最后再通过中心面生成另一侧即可。

在 GSD 中，我按照建模用途对特征树进行分类，而没有把所有对象放进同一个 Geometrical Set 里。这样既有利于组织当前结构，也方便之后扩展成更复杂的整车项目。下表对各个分组及其用途进行了总结：

| 分组 | 内容 |
|---|---|
| 基准 | 车辆中心面、纵向站位、水平面和横向控制面 |
| 构造点 | 截面特征点、边界端点和局部控制点 |
| 曲线 | 截面 Spline、导引曲线和封闭边界 |
| 支撑曲面 | Multi-Sections Surface、Fill 和局部延伸面 |
| 裁剪与连接 | Split、Trim、Boundary 和 Join |
| 最终结果 | 完成检查后保留的侧箱与后翼曲面 |

按照这种结构设计，每个曲面都可以追溯到自己的截面和边界。修改某个局部区域时，我只需要回到对应的点或样条，不必重新创建整个部件。我还为每个部件和构造对象设置了合适的名称，以便后续查找和检索。

## GSD 的基本建模顺序

每个曲面区域都按照同一个构建顺序进行：

```text
基准平面
→ 构造点
→ 截面 Spline
→ 导引曲线或封闭边界
→ Multi-Sections Surface / Fill
→ Split / Trim
→ Join
→ Symmetry
```

对于平面端面和封闭轮廓，我的处理方式是使用 Fill 建立曲面。对于自由曲面，我的处理方式是以多组截面 Spline 为主体。在截面之间，如果变化比较平缓，我使用 Multi-Sections Surface 连接；但当遇到曲率突变或轮廓快速收缩时，我会把区域拆成相邻的、更小的曲面，再通过 Join 组合。对于带孔区域，我的处理方式是先建立外部支撑面，再将内环投影到支撑面上，并进行 Split。

我只完成了右半侧的曲面和 Join，之后再进行对称处理。这样不仅能够得到与右侧一致的左侧几何结构，也能避免左右两侧同时修改，同时保证对称面始终由同一个中心基准控制。

## 侧箱

侧箱是一个非常复杂的大型几何体，我把整体分为了入口、肩部、下切区域、最大宽度、腰部收缩以及尾部过渡。它很难依靠一张大曲面完成，因为上表面、侧面和底部在不同纵向位置具有不同且复杂的曲率变化。我在侧箱的绘制上尝试了多种方法，最终达成了一个我比较满意的状态。

首先，我沿车身纵向建立一组站位平面，并在每个平面上布置轮廓点，用于确定入口高度、肩部宽度、底部轮廓和尾部收缩。每个站位上的点通过 Spline 连成一个开放截面。

完成主截面后，我使用 Multi-Sections Surface 建立侧箱的核心曲面：

- 肩部和尾部的变化相对平缓，可以由连续截面直接放样。
- 下切区域和局部转折部分变化较快，因此需要增加局部截面。

对于平面封盖区域和局部转折，我采用以下处理方式：

- 端面和局部平面区域使用封闭 Spline 配合 Fill。
- 窄小封闭区域根据边界逐段补面。
- 相邻截面快速变化时，将区域拆成一系列双截面曲面，再通过 Join 将它们组合成一个连续曲面。

这种分区方式保留了侧箱的主要体积，同时让入口、肩部、下切和尾部依然可以独立修改。最后，我把完成的右侧曲面对称到另一侧。

下面是我绘制的成果截图：

![侧箱等轴测视图](/images/projects/3dexperience-rb22/sidepod/sidepod_r1_iso.jpg)

![侧箱正视图](/images/projects/3dexperience-rb22/sidepod/sidepod_r1_front.jpg)

![侧箱右视图](/images/projects/3dexperience-rb22/sidepod/sidepod_r1_right.jpg)

![侧箱俯视图](/images/projects/3dexperience-rb22/sidepod/sidepod_r1_top.jpg)

## 后翼

后翼的结构与侧箱有所不同。后翼大致由主翼面、可动襟翼、端板、中央支撑和局部连接面组成。我依旧先完成每个功能区域，最后再检查它们之间的连接。

对于主翼面，我在不同展向位置建立截面 Spline，并用 Multi-Sections Surface 连接这些截面。当翼尖和中央区域需要额外控制时，我再加入端点导线来约束曲面的边界走向。襟翼使用独立的截面组，这样可以保留襟翼自身的位置和角度关系。

### 端板

端板先在支撑面上建立外轮廓，然后用 Fill 和裁剪曲面形成主体。带孔区域先完成外部曲面，再把内环投影到支撑面上进行 Split。这样一来，孔洞就属于曲面的裁剪结构，而不是悬空的装饰线。

对于中央支撑和局部连接面，我分别使用平面、挤出曲面和 Fill 生成。完成全部固定翼面、襟翼、端板和支撑后，最后进行 Join 和 Symmetry，得到完整的后翼。

截图如下：

![后翼等轴测视图](/images/projects/3dexperience-rb22/rear-wing/iso.jpg)

![后翼后视图](/images/projects/3dexperience-rb22/rear-wing/rear.jpg)

![后翼侧视图](/images/projects/3dexperience-rb22/rear-wing/side.jpg)

![后翼俯视图](/images/projects/3dexperience-rb22/rear-wing/top.jpg)

## 未完成的部分

在完成侧箱和后翼后，我会用同样的思路完成剩余部分：

| 建模区域 | 计划内容 |
|---|---|
| 前翼与鼻锥 | 主翼、襟翼、端板、鼻锥过渡和局部连接 |
| 底板与扩散器 | 底板主体、边缘结构、喉部、扩散段和围板 |
| 前后悬架 | 上下叉臂、推杆、转向拉杆及其整流外形 |
| 悬架导流件 | 轮胎前后的局部导流曲面 |
| Quadruplane | 多层导流翼面及其支撑 |
| 后视镜 | 镜壳、支架和与侧箱的连接 |
| 动力单元与变速箱外形 | 发动机罩内部包装边界和尾部收缩 |
| 座舱与 Halo | 座舱开口、头枕区域、Halo 和车身过渡 |
| 轮胎与轮毂 | 前后轮胎、轮毂面和接地区几何 |
| 车手头盔 | 用于座舱与气流遮挡的外部几何 |
| 风洞与 CFD 环境 | 地面、入口、出口和外部计算域所需几何 |


## CFD 规划

像我参考的文章一样，在完成整车 CAD 之后，我计划使用 OpenFOAM 对整车进行 CFD 模拟。届时可能会遇到网格量庞大的情况，我可能需要寻求老师的帮助或寻找赞助，确认是否能够获得足够的算力资源。

不过首先，我会先从零散部件开始试验。目前的想法是从侧箱和后翼开始：

- 侧箱：重点观察入口来流、肩部和下切区域的流动走向，以及尾部对后轮和发动机罩区域的影响。
- 后翼：重点观察各翼面负载、槽缝流动、端板涡和中央支撑的干扰。

后续的前翼、底板、悬架和车轮，我会使用一致的入口条件、地面和轮胎设置，以及统一的后处理指标。统一设置可以让不同几何之间的差异主要来自部件本身，避免计算域或边界条件变化带来的影响。每个部件都会在独立环境中检查网格、压力分布、表面流动、分离区域和主要涡结构。

最终，我计划进行整车层面的研究，分析上下游部件之间的相互作用。我知道其中还有很多困难，单个部件的结果也不能直接代替整车结论。逐个部件计算有助于理解每个区域的作用，但最终仍需要把全部曲面装入整车模型中，从整车角度研究前翼尾流、轮胎尾流、底板、侧箱与后翼之间的耦合关系。

未完待续，有进展会更新到此文中。
