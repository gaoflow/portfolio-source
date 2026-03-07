---
title: '3DEXPERIENCE GSD 建模——侧箱与后翼'
year: 2026
date: '2026-08-24'
status: active
categories: [design]
tags: [设计, CAD, GSD, 曲面建模]
summary: '我从空白 3D Shape 开始，在 3DEXPERIENCE 的 Generative Shape Design 中建立点、截面、样条、放样与裁剪曲面，完成侧箱和后翼，并继续推进整车其余部件。'
role: '独立 CAD 曲面建模'
duration: '侧箱与后翼完成 · 整车曲面建模进行中'
featured: true
order: 0
studySequence: 19
heroImage: /images/projects/3dexperience-rb22/sidepod/sidepod_r1_iso.jpg
---

我是看到了真车模型，然后有了在 3DEXPERIENCE 上重建 F1 的打算。

<div class="not-prose my-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
  <img src="/images/projects/3dexperience-rb22/f1-photos/IMG_4739.jpg" alt="真车模型的前侧三分之四视图" class="aspect-[3/2] h-full w-full rounded-lg object-cover" decoding="async" />
  <img src="/images/projects/3dexperience-rb22/f1-photos/IMG_4753.jpg" alt="真车模型的正面与前翼" class="aspect-[3/2] h-full w-full rounded-lg object-cover" decoding="async" />
  <img src="/images/projects/3dexperience-rb22/f1-photos/IMG_4756.jpg" alt="真车模型的侧箱与座舱区域" class="aspect-[3/2] h-full w-full rounded-lg object-cover" loading="lazy" decoding="async" />
  <img src="/images/projects/3dexperience-rb22/f1-photos/IMG_4765.jpg" alt="真车模型的后翼与后部车身" class="aspect-[3/2] h-full w-full rounded-lg object-cover" loading="lazy" decoding="async" />
</div>

## 项目出发点与参考

这项工作参考了 Ted L. 的文章 [《I Built an F1 Car — The 2026 Regulations》](https://www.linkedin.com/pulse/i-built-f1-car-2026-regulations-ted-l-dqfnc/)。原文从整车角度记录 2026 规则赛车的几何创建、法规取舍和 CFD 分析，也让我决定把整车拆成明确的部件，逐个完成曲面建模，再进入空气动力学计算。

侧箱和后翼使用既有 STEP 作为几何目标。本文所说的“从空白开始”，指我没有直接把目标曲面作为最终模型，而是在一个空白 3D Shape 中重新建立全部构造点、截面曲线、支撑面和结果曲面；它不表示这两个空气动力外形是在没有参考几何的情况下原创设计。

目前已经完成侧箱和后翼。文章重点放在我如何使用 3DEXPERIENCE 的 Generative Shape Design（GSD）把两个部件从空白工作区建立出来，以及整车其余部分准备怎样继续。

## 从空白 3D Shape 建立建模骨架

我先建立车辆中心面和一组沿车身纵向分布的基准平面。中心面控制左右对称，纵向平面承载侧箱截面和后翼局部截面；水平与横向平面则用于确定底部高度、端板位置和各个曲面之间的空间关系。

GSD 特征树按照建模用途分组，而不是把所有对象放在同一个 Geometrical Set 中：

| 分组 | 内容 |
|---|---|
| 基准 | 车辆中心面、纵向站位、水平面和横向控制面 |
| 构造点 | 截面特征点、边界端点和局部控制点 |
| 曲线 | 截面 Spline、导引曲线和封闭边界 |
| 支撑曲面 | Multi-Sections Surface、Fill 和局部延伸面 |
| 裁剪与连接 | Split、Trim、Boundary 和 Join |
| 最终结果 | 完成检查后保留的侧箱与后翼曲面 |

这样的结构让每张曲面都能追溯到自己的截面和边界。修改某个局部区域时，我只需要回到对应的点或样条，而不必重新建立整个部件。

## GSD 中的基本建模顺序

每个曲面区域都遵循同一条基础顺序：

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

自由曲面以多组截面 Spline 为主体。截面之间变化平缓时，可以用一张 Multi-Sections Surface 连接；遇到曲率突变或轮廓快速收缩时，我把区域拆成相邻的小曲面，再通过 Join 组合。平面端面和封闭轮廓使用 Fill，带孔区域先建立外部支撑面，再投影内环并 Split。

我只在完成右侧曲面及连接关系之后进行 Symmetry。这样可以避免左右两侧同时修改，也能保证对称面始终由同一个中心基准控制。

## 侧箱：用纵向截面控制体积变化

侧箱由入口、肩部、下切区域、最大宽度、腰部收缩和尾部过渡共同组成。它不能靠一张大曲面完成，因为上表面、侧面和底部在不同纵向位置具有不同的曲率变化。

我先沿车身纵向建立一组站位平面，再在每个平面上布置轮廓点。点的位置用于确定入口高度、肩部宽度、底部轮廓和尾部收缩；每个站位上的点通过 Spline 连成一个开放截面。

完成主截面后，我使用 Multi-Sections Surface 建立侧箱的核心曲面。肩部和尾部的变化较平缓，可以由连续截面直接放样；下切区域和底部转折较快，因此需要增加局部截面，避免一张曲面跨过真实的形状变化。

![侧箱等轴测视图](/images/projects/3dexperience-rb22/sidepod/sidepod_r1_iso.jpg)

### 平面、封闭区域和局部转折

侧箱的端面和局部平面区域使用封闭 Spline 加 Fill 建立。窄小封闭区域根据边界逐段补面；当相邻截面变化过快时，我把该区域拆成一系列两截面曲面，再将这些曲面 Join 成一个连续结果。

这种分区方式保留了侧箱的主要体积，同时让入口、肩部、下切和尾部仍然可以独立修改。最后完成的右侧曲面以车辆中心面生成另一侧结果。

![侧箱正视图](/images/projects/3dexperience-rb22/sidepod/sidepod_r1_front.jpg)

![侧箱右视图](/images/projects/3dexperience-rb22/sidepod/sidepod_r1_right.jpg)

![侧箱俯视图](/images/projects/3dexperience-rb22/sidepod/sidepod_r1_top.jpg)

## 后翼：把翼面、端板和支撑分开建模

后翼由主翼面、可动襟翼、端板、中央支撑和局部连接面组成。我没有把它作为一个整体一次生成，而是先完成每个功能区域，再在最终阶段检查它们之间的连接。

主翼面从翼型截面开始。我在不同展向位置建立截面 Spline，用 Multi-Sections Surface 连接这些截面；当翼尖或中央区域需要额外控制时，再加入端点导线约束曲面的边界走向。襟翼使用独立的截面组，因此可以保留自己的位置和角度关系。

![后翼等轴测视图](/images/projects/3dexperience-rb22/rear-wing/iso.jpg)

### 端板、孔洞与中央支撑

端板先在支撑面上建立外轮廓，再使用 Fill 或裁剪曲面形成主体。带孔区域先完成外部曲面，然后把内环投影到支撑面并 Split；这样孔洞属于最终曲面的裁剪结构，而不是悬空的装饰线。

中央支撑和局部连接面分别由平面、挤出曲面和 Fill 组成。完成固定翼面、襟翼、端板和支撑后，我才建立 Join 与 Symmetry，使右侧构造成为完整后翼。

![后翼后视图](/images/projects/3dexperience-rb22/rear-wing/rear.jpg)

![后翼侧视图](/images/projects/3dexperience-rb22/rear-wing/side.jpg)

![后翼俯视图](/images/projects/3dexperience-rb22/rear-wing/top.jpg)

## 接下来还要完成的整车部件

侧箱和后翼只是整车曲面工作的一部分。下一阶段将继续完成以下区域：

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

建模顺序会优先处理影响整车主气流的部件：前翼与鼻锥、底板与扩散器、座舱与 Halo、动力单元外形，然后再完成悬架、导流件、后视镜、车轮和辅助几何。

## 完成整车后逐个进行 CFD

全部部件完成后，我计划按部件逐个建立 CFD 算例。每个部件先在独立或简化装配环境中检查网格、压力分布、表面流动、分离区域和主要涡结构，再放回整车研究它与上下游部件的相互作用。

第一组计算将从已经完成的侧箱和后翼开始。侧箱重点观察入口来流、肩部和下切区域的流动走向，以及尾部对后轮和发动机罩区域的影响；后翼重点观察各翼面负载、槽缝流动、端板涡和中央支撑的干扰。

后续前翼、底板、悬架和车轮使用一致的入口条件、地面与轮胎设置以及后处理指标。统一设置可以让不同几何版本之间的差异来自部件本身，而不是来自变化的计算域或边界条件。

单部件结果不会直接代替整车结论。逐部件计算用于理解每个区域的作用，最终仍需要把全部曲面装入同一整车模型，检查前翼尾流、轮胎尾流、底板、侧箱和后翼之间的耦合。

## 当前阶段

侧箱和后翼已经建立了完整的 GSD 特征结构，包括基准、构造点、截面曲线、支撑曲面、裁剪、连接和对称结果。下一阶段将沿用同一套建模逻辑完成其余部件，再把整车从 CAD 工作转入逐部件 CFD 和最终整车计算。
