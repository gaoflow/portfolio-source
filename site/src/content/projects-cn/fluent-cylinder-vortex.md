---
title: '在 Fluent 中模拟卡门涡街'
year: 2026
date: '2026-04-11'
status: complete
categories: [component-cfd, validation]
tags: [CFD]
summary: '在这次 CFD 课程作业中，我们研究了两种圆柱绕流情况：Re=40 的稳态尾流和 Re=150 的非定常涡脱落。我搭建了两个 Fluent 算例，通过有意施加的速度区域扰动触发涡街，并记录升力和阻力。'
role: 'Fluent 仿真与数据验证'
duration: '4 周'
academic:
  institution: 'ESILV'
  course: '计算流体力学'
  assignment: '圆柱绕流的稳态与瞬态计算'
  requirements:
    - '求解 Re=40 的稳态层流圆柱绕流，并检查收敛性、质量平衡和阻力。'
    - '运行 Re=150 的瞬态算例，并通过受控速度扰动触发对称性破缺。'
    - '记录升力和阻力历程，并识别卡门涡街。'
    - '将受力结果与提供的实验参考值比较，并讨论差异。'
featured: true
order: 17
studySequence: 12
heroImage: /images/projects/fluent-cylinder-vortex/source/developed-vorticity.png
---

这是我 2026 年春季学期 Computation Fluid Dynamics 课程的实验记录。
## 作业描述

课程任务从一个很具体的流体问题开始：流体绕过圆柱时，为什么有时会留下稳定尾流，有时却会从两侧交替脱落涡旋？老师用自然界中的卡门涡街引入这个问题。岛屿像钝体一样迫使气流分离，两侧涡旋交替脱落，在下游留下可见的周期结构。

<figure>
  <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/course-karman-islands.png" alt="课程资料中智利 Juan Fernández 群岛下游的自然卡门涡街" loading="lazy">
  <figcaption>Juan Fernández 群岛下游的自然卡门涡街</figcaption>
</figure>

作业把两个流动状态放在一起：先计算 $Re=40$ 的稳态圆柱绕流，检查收敛、质量守恒、速度、流线、涡量、压力和阻力；再把 Reynolds 数提高到 150，换成瞬态求解，监测升力和阻力，并用一个无量纲数描述尾流的非定常节奏。这个数就是后面要测的 Strouhal 数。

<figure>
  <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/course-cylinder-flow-regimes.png" alt="课程资料中圆柱绕流从附着流到非定常涡脱落的五种状态示意图" loading="lazy">
  <figcaption>课程资料中的圆柱绕流状态示意图</figcaption>
</figure>

## 分情况考虑

我把老师的要求落到两种圆柱绕流上：$Re=40$ 的稳态对称尾流，以及 $Re=150$ 的非定常卡门涡街。我搭建了稳态和瞬态两个 Fluent 算例，再用一个受控扰动把涡街激发出来。计算完成后，我又把保留下来的监视器截图一张张数字化，重建了受力历程。结果一好一坏：涡脱落频率得到 $St=0.155$，但阻力比实验图表低了 29.3%。频率基本合理，压力阻力却还不够准。

根据老师要求，两个算例共用一套四边形网格，共 20,200 个节点，圆柱边缘约 100 个单元。密度为 1 kg/m³，圆柱直径为 1 m。瞬态算例还使用 Fluent Adapt 细化下游区域，残差目标设为 $10^{-3}$。

## $Re=40$ 稳态基准情况

在 $Re=40$ 时，我们发现尾流保持稳态，中心线上下对称。圆柱后方有两个闭合回流区，上下压力相互抵消，所以升力为零。这个稳态结果后来还有一个作用，在分析 $Re=150$ 的阻力误差时，它提供了一个独立对照。阻力可以具体分解为：

| 分量 | 力 | 系数 |
|---|---:|---:|
| 压力 | 2.0100 N | 3.2816 |
| 黏性 | 1.0615 N | 1.7330 |
| 总计 | 3.0714 N | 5.0146 |

<div class="space-y-8">
  <figure>
    <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/steady-velocity-magnitude.png" alt="雷诺数为 40 时圆柱周围对称的稳态速度大小场" loading="lazy">
    <figcaption>Re=40 的稳态速度场</figcaption>
  </figure>
  <figure>
    <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/steady-recirculation-streamlines.png" alt="雷诺数为 40 时圆柱后方对称双回流区的流线图" loading="lazy">
    <figcaption>Re=40 圆柱后方的双回流区</figcaption>
  </figure>
</div>

## $Re=150$ 的情况

$Re=150$ 的真实流动是不稳定的，圆柱后面会自己长出交替脱落的涡。但我的数值模型里，网格、入口和圆柱全都关于中心线完美对称。方程和边界条件都没有打破对称性，数值结果就可能长时间留在近似对称的状态。真实流动里的失稳，在这个算例里不会马上出现。

如果一直等下去，在有限的计算时间可能达不到我们想要的结果。所以我在初始化之后用 patch 人为加了一个不对称：在 $X>0.5$ m、$Y>0$ 的下游象限里加入 $+0.2$ m/s 横向速度。

扰动后的峰值速度为

$$
\sqrt{1^2+0.2^2}\approx1.02\ \text{m/s},
$$

与初始等值线一致。

<div class="space-y-8">
  <figure>
    <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/transverse-velocity-patch.png" alt="Fluent 中将横向速度设为 0.2 米每秒的 patch 配置" loading="lazy">
    <figcaption>横向速度扰动的 Patch 设置</figcaption>
  </figure>
  <figure>
    <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/patched-y-velocity.png" alt="施加扰动后下游象限中的初始 Y 速度场" loading="lazy">
    <figcaption>扰动后的初始 Y 速度场</figcaption>
  </figure>
</div>

这个扰动只负责给第一批涡定个相位，不决定最终频率。涡脱落稳定后，升力仍然围绕零点对称振荡，说明人工偏置没有留在充分发展的结果中。如果扰动一直在起作用，升力曲线会歪向一边。

## 探索尾流怎样从对称变成涡街

我们可以看到完整输出共 400 帧，以 30 fps 播放 13.33 秒。开始时，圆柱后方仍然接近对称。扰动放大后，上下剪切层先后卷起，涡旋开始交替脱落，最后形成稳定的卡门涡街。

<figure>
  <video class="w-full rounded-xl shadow-sm" controls autoplay muted loop playsinline preload="metadata" aria-label="Fluent 圆柱尾流从初始状态发展为卡门涡街的完整动画">
    <source src="/videos/projects/fluent-cylinder-vortex/vortex-evolution.mp4" type="video/mp4">
    你的浏览器不支持 HTML5 视频播放。
  </video>
  <figcaption>Re=150 的 400 帧横向速度动画</figcaption>
</figure>

## 从升力曲线读出 $St=0.155$

涡从圆柱上下表面交替脱落，每脱落一对，升力系数就完成一次围绕零点的周期振荡。充分发展后，振幅约为 $\pm0.117$。我用最直接的方法：取 $t>40$ s 之后的曲线，找升力向上穿过零点的时刻，用这些过零点数出六个周期。平均周期为 6.44 s，因此
$$
f=0.155\ \text{Hz},\qquad St=\frac{fD}{U}=0.155.
$$

为了进一步确认这个频率，我还对同一段数字化升力历程做了 Hann 窗 FFT。670 个样本的频率分辨率为 0.0252 Hz，最大非零频段位于 0.151 Hz，与过零法落在同一频率格内。升力历程可以显示周期有多长，瞬时场则告诉我周期结构在哪里。涡量图显示两条剪切层交替卷起，压力图显示驻点高压和下游交错的低压区。

<div class="space-y-8">
  <figure>
    <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/developed-vorticity.png" alt="雷诺数为 150 时圆柱尾流中交替脱落的涡量大小场" loading="lazy">
    <figcaption>Re=150 的涡量场</figcaption>
  </figure>
  <figure>
    <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/developed-pressure.png" alt="雷诺数为 150 时圆柱后方随涡脱落交替的静压场" loading="lazy">
    <figcaption>Re=150 的瞬时压力场</figcaption>
  </figure>
</div>

![充分发展阶段的升力频谱](/images/projects/fluent-cylinder-vortex/lift-spectrum.svg)

Re=150 最终时间步的力为：

| 分量 | 力 | 系数 |
|---|---:|---:|
| 压力 | 0.4385 N | 0.7159 |
| 黏性 | 0.1269 N | 0.2072 |
| 总计 | 0.5654 N | 0.9231 |

实验图表在该条件下对应约 0.8 N，仿真低了 29.3%。差距主要落在压力项上：压力阻力占计算总阻力的 78%，所以关键是圆柱后方的压力恢复，不是壁面黏性项。$Re=40$ 的稳态算例也出现了同方向的差距：计算阻力为 3.07 N，图表约为 4.2 N，低估 26.9%。一个稳态、一个瞬态，低估幅度却接近，说明 $Re=150$ 的差距不太像单一取样时刻造成的。

我推测一个可能原因是数值耗散。粗网格和较宽松的瞬态容差可能削弱脱落涡，填平尾流低压区，从而减小圆柱前后的压力差。还有一个容易踩的坑：残差收敛只能说明 Fluent 完成了当前离散方程，不能说明阻力已经准确。方程可以收敛得很漂亮，网格照样不够细。

两个工况导出的力与系数都满足 $C_D=F_D/0.6125$。但 $Re=40$ 和 $Re=150$ 的理论动压参考量分别是 2.0 和 0.5。这表明两个工况沿用了同一组参考值，没有分别换算系数。因此，直接拿这些系数与教材参考图表比较会混用不同定义。本文改为比较力，因为在同一几何中参考面积会抵消。

不过，其中的压力系数 3.2816 恰好接近参考图中的总阻力系数 3.28，但两者不是同一个物理量。数字接近不能作为验证，除非两边使用同一个定义。因此，本文使用导出的压力力、黏性力和总阻力，再按统一几何与课程参考曲线比较，不直接沿用原始 $C_D$。

<div class="space-y-8">
  <figure>
    <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/final-force-report.png" alt="Fluent 最终时间步的压力力、黏性力和总力数值" loading="lazy">
    <figcaption>Re=150 最终时间步的 Fluent 受力结果</figcaption>
  </figure>
  <figure>
    <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/experimental-drag-reference.png" alt="光滑圆柱实验阻力系数随雷诺数变化的参考曲线" loading="lazy">
    <figcaption>课程给出的光滑圆柱阻力参考曲线</figcaption>
  </figure>
</div>

## 最终数值结果

| 检查内容 | 结果 |
|---|---|
| Re=40 稳态收敛 | 53 次迭代，残差低于 $10^{-6}$ |
| Re=40 质量不平衡 | $5.84\times10^{-9}$ kg/s |
| 数字化与导出值的最终 $C_L$ | 0.075 对 0.069 |
| 数字化与导出值的最终阻力 | 0.555 N 对 0.565 N |
| 脱落周期 | 六个周期，标准差 0.03 s |
| Strouhal 数 | 0.155 |

## 小结

通过这次课程作业实战，首先我觉得我熟悉了 ANSYS 和 Fluent 的基本流程。我从几何、网格和边界条件开始，设置稳态和瞬态求解，再监测残差、升力和阻力，最后用速度、压力和涡量场检查结果。其次，我发现 CFD 的思考方式是很独特的，残差收敛只说明离散方程算完了，不代表所有物理量都足够准。频率和阻力也要分开判断：这次计算得到了合理的涡脱落频率，但压力阻力仍与参考值存在明显差距。我看清了这个算例的简化和边界。它是二维层流模型，只使用一套网格和一个 0.2 s 时间步，没有做网格和时间步细化。$St=0.155$ 只来自六个周期，当前网格也不足以精细解析决定分离点的边界层。因此，这些结果适合用来理解涡脱落和验证频率，不能把阻力当成高精度结果。

这是一个非常经典的研究案例，下一步我计划用 OpenFOAM 重做这个算例。复现 $Re=40$ 的稳态尾流和 $Re=150$ 的卡门涡街，再增加网格、时间步和计算域细化，延长取样时间，并直接导出升阻力历程。这样可以把现在的简化课程算例当成基准，再逐步查清网格、时间步和数值设置等对频率与阻力的影响。
