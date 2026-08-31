---
title: '数字孪生实战：在 Abaqus 上还原拉伸试验'
year: 2026
date: '2026-04-04'
status: complete
categories: [validation, design]
tags: [有限元分析]
summary: '我在 Abaqus 中重建 XC48 钢拉伸试验，用实测应力–应变数据标定三维损伤模型，并比较网格、求解器、加载和单元删除设置对断裂响应的影响。'
duration: '8 周'
academic:
  institution: 'ESILV'
  course: '材料与行为'
  assignment: 'XC48 拉伸试验与 Abaqus 数值重建'
  requirements:
    - '记录拉伸机输出和断后试样尺寸，并描述颈缩与断裂。'
    - '计算工程/真实应力–应变曲线，识别模量、屈服、极限和断裂强度。'
    - '把实验材料数据写入 Abaqus，并比较实验与数值曲线。'
    - '研究网格、求解器和加载幅值的影响，并说明最终配置。'
featured: false
order: 19
studySequence: 11
heroVideo:
  src: '/videos/projects/xc48-abaqus-twin/m2-von-mises-fracture.mp4'
  poster: '/images/projects/xc48-abaqus-twin/m2-von-mises-fracture-poster.webp'
  caption: 'M2 断裂演化'
heroImage: /images/projects/xc48-abaqus-twin/xc48-fracture-hero-cn.webp
cardImageFit: cover
---

这是我们在 2026 年春季学期 Materials and Behavior 课程中完成的一次拉伸试验记录。

## 先做真实拉伸试验

我们先对一根 XC48 钢哑铃形试样做单轴拉伸。试验机给出载荷和伸长，我们再记录断后尺寸，用 Excel 算出工程与真实应力–应变曲线。拿到这条实测曲线后，我们才开始搭 Abaqus 模型。想回答的问题很直接：数值曲线能不能跟上实测的硬化、颈缩和峰后下降？

<figure>
  <img src="/images/projects/xc48-abaqus-twin/source/teacher-handout-tensile-machine.png" alt="教师拉伸试验任务书中的拉伸机、夹具和哑铃形试样照片" loading="lazy">
  <figcaption>拉伸试验设备</figcaption>
</figure>

<figure>
  <img src="/images/projects/xc48-abaqus-twin/source/teacher-handout-specimen-geometry.png" alt="教师任务书中的哑铃形拉伸试样尺寸图，标出总长、肩距、标距和缩颈段" loading="lazy">
  <figcaption>试样尺寸定义</figcaption>
</figure>

## 第一版曲线

第一版计算保留了同一组 1,129 点源数据，却先用了 Ø10 mm 和 50 mm 标距的占位尺寸。曲线看起来完整，工程应力峰值却只有 489.09 MPa，真实应力峰值为 545.68 MPa。这个差距让我们回头检查计算输入，最后发现问题不在载荷数据，而在试样面积和标距。把几何尺寸改为实测的 Ø7.99 mm 和 70 mm 后，工程 UTS 变成 766.12 MPa。前两条曲线因此只保留为一次纠错记录，不再用于后面的材料输入。

$$
\varepsilon=\frac{\Delta L}{L_0},\qquad
\sigma=\frac{F}{A_0},\qquad
\varepsilon_T=\ln(1+\varepsilon),\qquad
\sigma_T=\sigma(1+\varepsilon)
$$

<figure>
  <img src="/images/projects/xc48-abaqus-twin/initial-tp-engineering-stress-strain.png" alt="使用 Ø10 mm 和 50 mm 占位几何计算的早期工程应力应变曲线，峰值为 489.09 MPa" loading="lazy">
  <figcaption>初版工程应力–应变曲线</figcaption>
</figure>

<figure>
  <img src="/images/projects/xc48-abaqus-twin/initial-tp-true-stress-strain.png" alt="使用占位几何从同一组源数据换算的早期真实应力应变曲线，峰值为 545.68 MPa" loading="lazy">
  <figcaption>初版真实应力–应变曲线</figcaption>
</figure>

<figure>
  <img src="/images/projects/xc48-abaqus-twin/geometry-correction.svg" alt="占位直径和标距与验证后试样尺寸的对比，以及工程 UTS 从 489.09 MPa 变为 766.12 MPa" loading="lazy">
  <figcaption>试样尺寸纠正</figcaption>
</figure>

## 确定实验结果

尺寸修正后，我们保留以下实验结果，后面的 Abaqus 计算都以它们为基准。

| 物理量 | 数值 | 说明 |
|---|---:|---|
| 杨氏模量 | 12.28 GPa | 受试验机和夹具柔度影响 |
| 0.2% 偏移屈服强度 | 758.33 MPa | 修正后的结果 |
| 工程 UTS | 766.12 MPa | 工程应变 7.6% |
| 真实应力峰值 | 828.4 MPa | 由修正后的实验数据重算 |
| 断裂强度 | 557.80 MPa | 最终载荷骤降前 |
| 断裂应变 | 13.4% | 工程应变 |
| 颈缩 | Ø7.99 → 5.77 mm | 截面积缩减 47.8% |

杨氏模量只有 12.28 GPa，远低于钢常见的约 210 GPa。这里的横梁位移还包含试验机框架和夹具的变形，所以这条实测曲线比材料本身更“软”。Abaqus 模型沿用了这条斜率，因此后面的高 $R^2$ 只能说明数值曲线贴近本次试验。

有了这组实验基准，下一步才是把它变成 Abaqus 能理解的几何、材料和边界条件。

## Abaqus 结果分析

我们建立了完整的三维哑铃形试样，并用 C3D4 线性四面体单元离散。试样一端完全固定，也就是 `ENCASTRE`；另一端只沿轴向拉伸，在 1 s 内移动 15 mm。拉伸到颈缩和断裂时，形状变化已经不能当作小变形处理，所以分析步启用了大变形选项 `nlgeom=YES`。

材料设置分成峰值前和峰值后两段。峰值前，弹性参数和真实塑性数据决定材料怎样从弹性进入塑性、又怎样继续硬化；峰值后，损伤起始、损伤演化和单元删除决定曲线怎样变软，以及试样最后怎样分开。对应到材料卡片，我们采用 $E=12{,}283.5$ MPa、$\nu=0.3$、真实塑性数据、延性损伤、0.5 mm 位移型损伤演化和单元删除。最终加载幅值采用 Smooth Step，原因会在后面的能量检查中说明。

<figure>
  <img src="/images/projects/xc48-abaqus-twin/abaqus-baseline-meshed-specimen.png" alt="Abaqus 中完整哑铃形拉伸试样的基准 C3D4 四面体网格视图" loading="lazy">
  <figcaption>基准四面体网格</figcaption>
</figure>

Abaqus 请求了 200 个场输出间隔，这样既能看到整体曲线，也能顺着时间观察颈缩和断裂。我们从加载端的位移和反力重建工程应力–应变曲线，再检查 70 mm 标距段内的应力和应变，得到用于对照的真实曲线。这样，数值结果和实验结果用的是同一套几何基准。

曲线只能告诉我们整体上拉了多大力、伸长了多少，不能单独说明断裂过程是否合理。因此我们同时看四类结果：用应力 `S` 和等效塑性应变 `PEEQ` 找应力集中与塑性局部化；用损伤变量 `SDEG` 和单元状态 `STATUS` 跟踪损伤增长及单元删除；用位移和反力重建曲线；再用动能 `ALLKE` 和内能 `ALLIE` 做基本的惯性检查。

这也决定了后面的判断方式。$R^2$ 可以概括整条曲线的接近程度，但我们不会只看一个分数，还要一起看颈缩形状、应力集中位置和单元删除的节奏。

## 对网格的研究

由于电脑性能和 Abaqus Learning Edition 的规模限制，我们没有无限加密网格。M2 的近似全局种子尺寸为 4.5，并启用曲率控制；其余三套网格用来观察离散尺度会怎样改变曲线和断裂区域。

<figure>
  <img src="/images/projects/xc48-abaqus-twin/m2-global-seed-settings.png" alt="Abaqus 全局种子设置对话框，近似全局尺寸为 4.5，并启用曲率控制" loading="lazy">
  <figcaption>全局种子设置</figcaption>
</figure>

我们用同一条实验曲线比较基准网格、M1、M2 和 M3。判断标准是曲线拟合度和断裂区域的变化。

| 网格 | 单元数 | $R^2$ | 主要表现 |
|---|---:|---:|---|
| 基准网格 | 3,846 | 0.9308 | 峰后继续硬化 |
| M1 | 830 | 0.9653 | 应变集中在少量单元 |
| M2 | 1,975 | **0.9663** | 捕捉颈缩和峰后下降 |
| M3 | 2,928 | 0.9497 | 过度局部化 |

<figure>
  <img src="/images/projects/xc48-abaqus-twin/abaqus-m1-von-mises-result.png" alt="Abaqus M1 网格在计算末帧的变形、Von Mises 应力云图和分离试样" loading="lazy">
  <figcaption>M1 断裂结果</figcaption>
</figure>

<figure>
  <img src="/images/projects/xc48-abaqus-twin/abaqus-m2-von-mises-fracture-stage.png" alt="Abaqus M2 网格在断裂阶段的颈缩、变形和 Von Mises 应力云图" loading="lazy">
  <figcaption>M2 断裂结果</figcaption>
</figure>

<figure>
  <img src="/images/projects/xc48-abaqus-twin/abaqus-m3-von-mises-result.png" alt="Abaqus M3 更密四面体网格在计算末帧的变形和 Von Mises 应力云图" loading="lazy">
  <figcaption>M3 断裂结果</figcaption>
</figure>

<figure>
  <img src="/images/projects/xc48-abaqus-twin/mesh-r2-comparison.png" alt="基准、M1、M2 和 M3 网格与实验真实应力应变曲线的拟合比较" loading="lazy">
  <figcaption>网格敏感性对比</figcaption>
</figure>

M1 只有 830 个单元，塑性应变集中在少量单元中。M2 增加到 1,975 个单元后，曲线出现了实验中能看到的颈缩和峰后下降，$R^2=0.9663$。M3 继续加密到 2,928 个单元，损伤却更加局部，$R^2$ 反而降到 0.9497。基准网格虽然有 3,846 个单元，峰后仍继续硬化，和实验的下降趋势不符。

这些结果说明，加入损伤和单元删除后，网格尺寸会改变局部化和删除发生的节奏。我们综合曲线、颈缩形状、应力集中和删除过程，保留了 M2。这是当前限制下的配置选择，不能写成已经得到网格收敛。

网格定下来后，剩下的问题是：哪一种求解设置能把计算继续推进到材料变软并分离？

## 两套求解设置

存档里保留了 Static General 和 Dynamic Explicit 两套解法。Static General 进入颈缩和损伤阶段后，材料软化带来的负刚度让迭代难以继续，曲线拟合为 $R^2=0.9595$。Dynamic Explicit 不依赖同样的静力迭代过程，可以继续算到损伤扩展和单元删除，参考计算达到 $R^2=0.9653$。

这两份存档的位移和损伤设置并不完全相同，因此不能把它们当成只改了求解器的单变量敏感性试验。0.9653 也只是这次 Explicit 参考计算的结果，和最终 M2 组合的 0.9663 不是同一次计算。我们保留 Explicit，主要因为它能继续穿过峰后的软化和删除阶段，不是因为一个 $R^2$ 就能证明它普遍优于 Static。

<figure>
  <img src="/images/projects/xc48-abaqus-twin/static-vs-explicit-comparison.png" alt="实验真实应力应变曲线与 Static General 和 Dynamic Explicit 数值结果的比较" loading="lazy">
  <figcaption>Static 与 Explicit 对比</figcaption>
</figure>

但换成 Explicit 会带来一个新问题：真实拉伸是缓慢加载，显式计算却可能把一次拉伸算成冲击。下一步需要检查惯性有没有主导结果。

## Explicit 还得通过基本的准静态检查

我们用动能 `ALLKE` 和内能 `ALLIE` 检查惯性影响。Smooth Step 会把加载起点和终点的速度、加速度变化放缓；在线性 Ramp 中，速度突然建立，会激起开头的冲击和后续振荡；突然 Step 则更像直接撞上试样。

在 Smooth Step 计算中，断裂前的 `ALLKE/ALLIE` 不超过 5%，能量尖峰主要出现在断裂时。它通过了这篇文章采用的基本准静态检查，但这不等于已经完成了所有显式动力学验证。

<figure>
  <img src="/images/projects/xc48-abaqus-twin/smooth-step-energy-history.png" alt="Smooth Step 显式计算中内能 ALLIE 与动能 ALLKE 随时间变化的曲线" loading="lazy">
  <figcaption>Smooth Step 能量历史</figcaption>
</figure>

加载方式会直接影响这项检查。三种幅值的表现如下：

| 加载方式 | 结果 |
|---|---|
| Smooth Step | 断裂前 `ALLKE/ALLIE` 不超过 5% |
| 线性 Ramp | 出现初始冲击和惯性振荡 |
| 突然 Step | 加载表现接近冲击 |

<figure>
  <img src="/images/projects/xc48-abaqus-twin/loading-amplitude-comparison.png" alt="实验曲线与 Smooth Step、Ramp 和 Step 三种加载幅值的真实应力应变比较" loading="lazy">
  <figcaption>加载幅值对比</figcaption>
</figure>

因此，我们把 Smooth Step 留在最终配置中。到这里，几何、材料、网格、求解器和加载方式都有了各自的选择依据，最后才能回到整条实验曲线。

## 最终曲线到底对上了多少

最终组合是 M2 + Dynamic Explicit + Smooth Step，整条曲线的 $R^2=0.9663$。在峰值之前，数值曲线跟上了实验的塑性硬化趋势；数值真实应力峰值约 820 MPa，实验峰值为 828.4 MPa，相差约 1%。

过峰之后，试样开始颈缩，损伤增长，随后发生单元删除，数值曲线也随之下降。这里仍有看得见的差距：数值曲线的尾段下降得更慢，保持在偏高的位置。因此，$R^2=0.9663$ 表示整条曲线总体接近，不表示每一段都完全重合。峰值附近的吻合较好，峰后的软化和断裂尾段只能作为趋势上的重建。

<figure>
  <img src="/images/projects/xc48-abaqus-twin/final-numerical-experimental-validation.png" alt="最终 M2 Dynamic Explicit Smooth Step 数值曲线与实验真实应力应变曲线比较，R 平方为 0.9663" loading="lazy">
  <figcaption>最终数值与实验曲线</figcaption>
</figure>

## 小结

回看这门课程的实验，我们先纠正试样几何，用修正后的实验曲线建立材料数据；再通过曲线、颈缩、应力集中和单元删除选择 M2；随后保留能继续计算软化与断裂的 Explicit，并用 Smooth Step 控制加载冲击。最后再把数值曲线放回实验基准中，分别看硬化、峰值和峰后下降。

这项结果有很多受限条件，比如它来自单根试样的一次实验，没有重复性区间，损伤参数也取自同一条曲线。偏低的模量说明部分拟合来自试验机和夹具柔度；Learning Edition 版本的 Abaqus 也限制了网格规模。

不过，这门课程过后，我们知道了试样为什么会在这些设置下断开，也知道曲线的哪些部分可以相信、哪些部分仍要保留判断。还是一次非常不错的 Abaqus 数字孪生实战过程。
