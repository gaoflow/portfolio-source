---
title: '用精确解、网格和实验数据对比分析 Fluent 结果'
year: 2026
date: '2026-03-12'
status: complete
categories: [component-cfd, validation]
tags: [CFD]
summary: '用 Poiseuille 精确解检查 Fluent 管流计算，再对圆柱绕流做网格、计算域和 Re=0.1–20 扫描，并与实验数据比较。'
role: 'Fluent 仿真、数据验证与报告整理'
duration: '7 周'
academic:
  institution: 'ESILV'
  course: '计算流体力学'
  assignment: '管流精确解验证与圆柱绕流验证研究'
  requirements:
    - '根据 Poiseuille 速度、壁面剪切力、压降和入口段长度验证层流管流。'
    - '在 Re=10 时确认圆柱网格无关性。'
    - '确认远场计算域无关性。'
    - '将雷诺数从 0.1 扫描至 20，并在课程规定的 5% 门槛下与给定实验表中的阻力进行比较。'
featured: false
order: 16
studySequence: 9
heroImage: /images/projects/fluent-cyl-vnv/velocity-re20.png
---

这是我 2026 年春季学期 Computation Fluid Dynamics 课程的实验记录。
## 老师要求

课程任务先给了我们一根长 10 m、直径 0.4 m 的圆管：流体以均匀的 1 m/s 速度进入，然后在管壁摩擦下逐渐发展为充分发展流。老师要求先算 Reynolds 数和解析入口段长度，判断管子是否足够长；再检查收敛、质量守恒、速度剖面、壁面剪切和压力下降，最后与 Poiseuille 精确解对比。课程示意图把这个过程画得很直接：两侧边界层从入口开始变厚，在入口段末端汇合，之后速度剖面保持抛物线形状。这也是学习 CFD 非常好的入门案例。

<figure>
  <img class="w-full" src="/images/projects/fluent-cyl-vnv/source/course-pipe-entrance-region.png" alt="课程资料中管道边界层发展和入口段长度的示意图" loading="lazy">
  <figcaption>课程资料中的管流入口段示意图</figcaption>
</figure>

圆柱绕流任务把问题换成了没有闭式解的外流：外边界要足够远，圆柱边缘和整个流体域要有明确的网格规模，结果还要检查收敛、质量守恒、流场以及阻力，并与课程给定的光滑圆柱阻力曲线比较。

<figure>
  <img class="w-full" src="/images/projects/fluent-cyl-vnv/source/course-cylinder-drag-reference.png" alt="课程资料给出的光滑圆柱与球体阻力系数随 Reynolds 数变化的参考曲线" loading="lazy">
  <figcaption>课程给出的光滑圆柱阻力参考曲线</figcaption>
</figure>

接下来，我先用有精确解的管流检查计算流程，再换到圆柱绕流，逐一查网格、计算域和实验差异。然后我在思考 Fluent 给出的数字是否可信？

## 用管流校准计算流程

管道长 10 m、半径 0.2 m，入口平均速度 1 m/s，密度 1 kg/m³，动力黏度 0.004 Pa·s，所以 $Re=100$。在 Fluent 我用了 500 个四边形单元、561 个节点。对比结果如下：

| 检查内容 | 解析值 | Fluent 结果 |
|---|---:|---:|
| 收敛 | 残差低于 $10^{-6}$ | 第 53 次迭代达到 |
| 质量不平衡 | 0 | $-2.8\times10^{-10}$ kg/s |
| 中心线最大速度 | 2.00 m/s | 1.98 m/s |
| 壁面剪切力 | 0.08 Pa | 0.08 Pa |
| 充分发展压降 | 8 Pa | 8.65 Pa |
| 入口段长度 | 2.4 m | 约 2.4 m |

先看速度场，检查均匀入流是否真的逐步发展成了 Poiseuille 抛物线剖面。

<div class="space-y-8">
  <figure>
    <img class="w-full" src="/images/projects/fluent-cyl-vnv/source/pipe-velocity-development.png" alt="管道内速度从均匀入口向抛物线剖面发展的云图" loading="lazy">
    <figcaption>管内速度从均匀入口逐步发展</figcaption>
  </figure>
  <figure>
    <img class="w-full" src="/images/projects/fluent-cyl-vnv/source/pipe-velocity-profiles.png" alt="管道入口附近与下游位置的轴向速度剖面对比" loading="lazy">
    <figcaption>入口区与充分发展区的速度剖面</figcaption>
  </figure>
</div>

中心线速度差了 1%。多出来的 0.65 Pa 压降来自入口区：速度剖面还没长成抛物线之前，壁面处的速度梯度更大，摩擦自然更大。从图上目测，入口段长度约为 2 m。中心线速度几乎达到最终值的 99%，结果约为 2.4 m，所以与解析关系一致。

<div class="space-y-8">
  <figure>
    <img class="w-full" src="/images/projects/fluent-cyl-vnv/source/pipe-centerline-velocity.png" alt="管道中心线速度沿轴向逐渐趋近最终值的曲线" loading="lazy">
    <figcaption>中心线速度沿管长的变化</figcaption>
  </figure>
  <figure>
    <img class="w-full" src="/images/projects/fluent-cyl-vnv/source/pipe-pressure-drop.png" alt="管道中心线静压沿轴向下降的曲线" loading="lazy">
    <figcaption>中心线静压沿管长的变化</figcaption>
  </figure>
</div>

## 检查没有精确解的圆柱算例

圆柱直径 1 m，外部流体域是一个直径 $D_2$ 的圆。密度 1 kg/m³，动力黏度 $10^{-3}$ Pa·s，靠改入口速度来换 Reynolds 数。模型是二维、稳态、层流、不可压缩。入口给均匀速度，出口给零表压，圆柱壁面无滑移。

我先在 $Re=10$ 下把网格和计算域的平台找出来，再固定这套设置，从 $Re=0.1$ 扫到 20。

<figure>
  <img class="w-full" src="/images/projects/fluent-cyl-vnv/source/cylinder-domain-geometry.png" alt="圆柱外流计算域中内圆和外圆的直径参数" loading="lazy">
  <figcaption>圆柱与可调外边界的参数化几何</figcaption>
</figure>

| 单元数 | 50 | 200 | 450 | 800 | 12,800 | 28,800 | 40,000 |
|---|--:|--:|--:|--:|--:|--:|--:|
| $C_D$ | 3.1328 | 2.7982 | 2.7757 | 2.7800 | 2.7938 | 2.7953 | 2.7973 |

从 12,800 个单元开始，$C_D$ 的变化低于 0.1%。最终保留 40,000 个单元和 $C_D=2.7973$。

![Re=10 下的网格敏感性](/images/projects/fluent-cyl-vnv/mesh-sensitivity.svg)

值得注意的是，从 12,800 加密到 28,800，变化只有 0.05%，两个点靠得很近。但两个接近的细网格点并不能证明平台存在，它们可能只是碰巧都还没到。所以我反过来往粗的方向扫。50 单元的网格给出 3.1328，比最终值高了约 12%。正是这个粗网格点说明结果确实随分辨率变化，变化的方向和幅度都看得见，这才真正有说服力。

固定网格之后，我把外部区域的直径从 100 m 加到 200 m：

| $D_2$ | 100 m | 120 m | 150 m | 180 m | 200 m |
|---|--:|--:|--:|--:|--:|
| $C_D$ | 2.7973 | 2.7889 | 2.7806 | 2.7751 | 2.7723 |

100 m 到 200 m 的变化低于 1%，所以保留 100 m。

![固定网格下的计算域敏感性](/images/projects/fluent-cyl-vnv/domain-sensitivity.svg)

更小的 20–80 m 计算域会把 $C_D$ 抬到约 3.05，说明外边界确实会勒住流动。不过这几个低端点同时用了更粗的边界划分，所以它们只能说明计算域效应的量级，没法把它和网格效应彻底分开。

扫描用的是同一套约 20,200 节点的网格和 $D_2=50$ m。$Re$ 从 0.1 涨到 20，$C_D$ 从 92.4 降到 2.06。

| $Re$ | 入口速度（m/s） | 阻力（N） | $C_D$ |
|---:|---:|---:|---:|
| 0.1 | $10^{-4}$ | $4.62\times10^{-7}$ | 92.4 |
| 0.5 | $5\times10^{-4}$ | $2.42\times10^{-6}$ | 19.37 |
| 1 | $10^{-3}$ | $5.71\times10^{-6}$ | 11.43 |
| 5 | $5\times10^{-3}$ | $5.14\times10^{-5}$ | 4.11 |
| 10 | $10^{-2}$ | $1.43\times10^{-4}$ | 2.85 |
| 20 | $2\times10^{-2}$ | $4.11\times10^{-4}$ | 2.06 |

下面两个动画依次播放 $Re=0.1$、0.5、1、5、10 和 20 的真实 Fluent 输出。

<div class="space-y-8">
  <figure>
    <video class="w-full rounded-xl shadow-sm" controls autoplay muted loop playsinline preload="metadata" aria-label="Reynolds 数从 0.1 增加到 20 时圆柱周围速度场的工况扫描动画">
      <source src="/videos/projects/fluent-cyl-vnv/reynolds-velocity-sweep.mp4" type="video/mp4">
      你的浏览器不支持 HTML5 视频播放。
    </video>
    <figcaption>Re=0.1–20 的速度场扫描</figcaption>
  </figure>
  <figure>
    <video class="w-full rounded-xl shadow-sm" controls autoplay muted loop playsinline preload="metadata" aria-label="Reynolds 数从 0.1 增加到 20 时圆柱周围静压场的工况扫描动画">
      <source src="/videos/projects/fluent-cyl-vnv/reynolds-pressure-sweep.mp4" type="video/mp4">
      你的浏览器不支持 HTML5 视频播放。
    </video>
    <figcaption>Re=0.1–20 的静压场扫描</figcaption>
  </figure>
</div>

端点图把两端的差异展开来看。$Re=0.1$ 时，黏性影响扩散到很大的范围，圆柱后方只有平滑的低速区；到 $Re=20$ 时，尾流更集中，上游驻点高压和下游低压也更清楚。

<div class="space-y-8">
  <figure>
    <img class="w-full" src="/images/projects/fluent-cyl-vnv/source/velocity-re0.1.png" alt="雷诺数为 0.1 时圆柱周围的 Fluent 速度大小云图" loading="lazy">
    <figcaption>Re=0.1 的速度场</figcaption>
  </figure>
  <figure>
    <img class="w-full" src="/images/projects/fluent-cyl-vnv/velocity-re20.png" alt="雷诺数为 20 时圆柱周围的 Fluent 速度大小云图" loading="lazy">
    <figcaption>Re=20 的速度场</figcaption>
  </figure>
  <figure>
    <img class="w-full" src="/images/projects/fluent-cyl-vnv/source/pressure-re0.1.png" alt="雷诺数为 0.1 时圆柱周围的 Fluent 静压云图" loading="lazy">
    <figcaption>Re=0.1 的静压场</figcaption>
  </figure>
  <figure>
    <img class="w-full" src="/images/projects/fluent-cyl-vnv/pressure-re20.png" alt="雷诺数为 20 时圆柱周围的 Fluent 静压云图" loading="lazy">
    <figcaption>Re=20 的静压场</figcaption>
  </figure>
</div>

## 对比 6 个实验

跟课程讲义的实验表进行比对，六个点里只有 $Re=20$ 进了 5% 误差范围：
| $Re$ | 0.1 | 0.5 | 1 | 5 | 10 | 20 |
|---|--:|--:|--:|--:|--:|--:|
| 相对误差 | 81.2% | 51.1% | 48.9% | 32.4% | 17.5% | 3.83% |

另外五个点都没有通过 :(

为什么低雷诺数差得最多？我事后分析一层原因是设置：扫描网格比 $Re=10$ 那套 40,000 单元的参考网格粗，计算域也更小。光是这些设置差异，就把 $Re=10$ 的 $C_D$ 从 2.7973 抬到了 2.85。另一个可能原因来自模型假设。$Re\le1$ 时，稳态二维是个更强的假设。$Re=0.1$ 那次运行，连续性残差还停滞了，速度残差只压到 $10^{-3}$，所以 92.4 这个数是六个结果里最不可信的。

<figure>
  <img class="w-full" src="/images/projects/fluent-cyl-vnv/source/re-0.1-residuals.png" alt="雷诺数为 0.1 时连续性和速度残差的迭代历程" loading="lazy">
  <figcaption>Re=0.1 的残差历程</figcaption>
</figure>

管流文字记录写的是 1,000 单元网格，唯一保留的控制台日志则来自 500 单元算例。本文按日志的工况口径使用数据。另一处差异来自圆柱表面压力系数 $C_p$ 曲线：标为 $Re=20$ 的导出图与 $Re=10$ 文件相同。因此，本文不用这张 $C_p$ 曲线支持 $Re=20$ 的判断。$Re=20$ 的静压云图和力数据表仍与该工况对应。因此，我们可以看到，每个数字都要先对上具体工况。文件名和图注只是线索，日志和原始结果才能确定数据归属。

## 小结

这项作业是我建立 CFD 验证思路的起点。我先做了两类相对简单的稳态问题：用 Poiseuille 精确解检查管流，再用网格、计算域和外部参考值检查低 Reynolds 数圆柱绕流。这一阶段先解决一个基础问题：一个稳态 CFD 结果，要经过哪些检查才值得信。

网格平台也不能只看两个靠得很近的细网格点。我还要往粗网格方向扫，看到结果明显离开平台；计算域也要单独改变，才能判断外边界是否还在影响阻力。6 个 Reynolds 数工况中，只有 $Re=20$ 进入 5% 误差范围。这说明残差收敛只是起点，不代表模型、网格和计算域已经足够准。

这里的研究停在 $Re\le20$ 的二维稳态层流。建立好这套验证顺序后，我才在后续作业中把同一个圆柱问题推到更高 Reynolds 数：先用 $Re=40$ 建立稳态尾流基准，再用 $Re=150$ 研究非定常涡脱落、升阻力历程和 Strouhal 数。这样的递进关系很清楚：先判断稳态结果是否可信，再研究流动如何随时间发生变化。
