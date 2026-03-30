---
title: '我们怎样用 Abaqus 分析汽车吸能器'
year: 2026
date: '2026-03-28'
status: complete
categories: [design, validation]
tags: [有限元分析]
summary: '我们从一个失败的初版模型出发，完成材料探索、归档完整的 30 km/h 冲击模型和三种截面比较；结果显示吸能、峰值力与结构质量必须一起判断。'
role: '联合建模、结果核验与报告撰写'
team: '四人课程项目'
duration: '6 周'
academic:
  institution: 'ESILV'
  course: '计算固体力学'
  assignment: '汽车吸能器的动态冲击与形状探索'
  note: '这是一个四人共同完成的计算固体力学课程项目。本文以联合作者口吻复盘归档模型、最终 LaTeX 报告和原始结果文件，并明确区分作业要求、建模选择与尚未验证的结论。'
  requirements:
    - '模拟汽车前纵梁的动态冲击。'
    - '使用课程提供的 energy absorber.stp 模型。'
    - '参考 CRASH-UNIT09-W06-CurvedBeam.pdf，并绘制力–位移曲线。'
    - '尝试不同形状，可参考 Fang 等人的 FGT 论文或 CRASH-UNIT06-W02-RailCrush.pdf。'
  media:
    - src: '/images/projects/abaqus-energy-absorber/assignment-front-rail.jpeg'
      alt: '课程任务书中用红色标出前纵梁位置的白车身图片'
      caption: '图片嵌在课程任务书中，用来说明前纵梁在整车中的位置；归档文件没有保留它原始的外部出处。'
featured: false
order: 18
studySequence: 10
heroImage: /images/projects/abaqus-energy-absorber/baseline-geometry-dimensions.png
---

## 先把作业要求和建模选择分开

我们重新检查了完整归档：课程 README、`energy absorber.stp`、`CRASH-UNIT09-W06-CurvedBeam.pdf`、`CRASH-UNIT06-W02-RailCrush.pdf`、Fang 等人的功能梯度厚度（FGT）论文，以及项目目录中的 Abaqus 文件、结果动画和最终 LaTeX 报告。

原始 README 的要求其实只有四项：模拟汽车前纵梁的动态冲击；使用给定的 STEP 几何；参考曲梁案例绘制力–位移曲线；再尝试不同形状，必要时参考 RailCrush 案例与 FGT 论文。任务书**没有**规定材料、冲击速度、冲击体质量、网格、评分细则或必须比较多少个方案。这些参数都是我们在建模过程中作出的选择，不能反写成老师的要求。

页首几何图来自最终 LaTeX 报告引用的原始 PNG，而不是 PDF 页面截图。它标出了基准 Model A 的 1000 mm 长度、主要截面尺寸，以及 1.2 mm 帽形件与 0.8 mm 封板。

我们用三个常见指标解释结果：比吸收能 $SEA=E/M$ 衡量单位质量的吸能；峰值压溃力 $F_{max}$ 反映首次冲击有多猛烈；碰撞力效率 $CFE=F_{mean}/F_{max}$ 则衡量压溃平台是否稳定。力–位移曲线下的面积

$$
W=\int F\,dx
$$

对应结构在该行程内做的功。好的设计不是单纯把力做大，而是在有限行程和质量约束下，控制峰值并维持稳定的压溃平台。

单位也必须先讲清楚。归档模型采用 mm–tonne–s 制，Abaqus 输出的能量单位是 N·mm：

$$
1\times10^6\ \text{N·mm}=1\ \text{kJ}.
$$

因此报告曲线上的 $3.5\times10^6$ N·mm 应写成 3.5 kJ，而不是 $3.5\times10^6$ J。

## 三个归档版本：失败、探索与最终模型

项目文件保留了 V1、V2 和 V3。它们不是同一个已经验证的模型逐步调参，而是可靠性不同的三个阶段。

### V1：属性缺失，不能形成有效结果

V1 有 328 个单元没有分配截面或材料属性，求解没有产生可用的冲击过程。它的意义只在于暴露建模检查清单中的第一项：提交作业前必须核对所有单元的 section assignment。我们不再把 V1 的任何画面或曲线当作成功结果。

### V2：材料比较有方向性，但没有通过数值质量检查

V2 使用 393 个 C3D8R 单元、902 个节点，冲击速度为 13,888 mm/s（约 50 km/h），分析时间 0.04 s，摩擦系数 0.3。归档中的四个作业都显示完成，但这不等于四种材料结果都有效：所谓 HLE 作业的吸能器仍引用 `material=Alu`，因此不能作为高强钢结果，本文将它排除。

更严重的问题是 V2 使用了固定质量缩放系数 100，求解记录显示增加质量约 9900%。铝算例末期的人工能量与内能之比为

$$
ALLAE/ALLIE\approx 15\%,
$$

已经足以动摇力峰值和能量分配的定量可信度。因此钢、铝、镁的结果只适合作为探索性材料筛选，不能写成经过验证的材料排名。

<figure>
  <img src="/images/projects/abaqus-energy-absorber/steel-aluminium-force-comparison.png" alt="V2 钢和铝模型的力位移曲线，钢曲线峰值高于铝" loading="lazy">
  <figcaption>最终 LaTeX 报告使用的原始力–位移图：钢的峰值约 190 kN，铝约 115 kN；曲线面积约为 58×10⁶ 与 46×10⁶ N·mm，即 58 与 46 kJ。由于质量缩放过强，这些数值只能说明趋势。</figcaption>
</figure>

在相近压溃行程内，钢吸收的绝对能量较多、峰值也更高；铝密度更低，因而显示出更好的潜在质量效率。但这只是下一轮建模的依据，而不是“铝已经最优”的结论。要做可信的材料比较，仍需在相同几何、相同网格、相同冲击条件和可接受的人工能量水平下重跑。

### V3：最完整、也最值得保留的冲击模型

V3 是归档中最完整的单次冲击模型。帽形纵梁与封板都采用 1 mm 厚度，两个部件以 Tie 约束连接；接触使用 general contact，摩擦系数 0.3。模型包含 405 个可变形单元和 961 个节点，刚性壁质量为 1.0 tonne（1000 kg），初速度 8333 mm/s（约 30 km/h），分析时间 0.06 s。与 V2 不同，V3 没有固定质量缩放，作业正常完成。

<figure>
  <video controls playsinline muted loop preload="metadata" style="display:block;width:100%;height:auto;">
    <source src="/images/projects/abaqus-energy-absorber/v3-crash-result.mp4" type="video/mp4">
    你的浏览器不支持 HTML5 视频。
  </video>
  <figcaption>V3 原始 Abaqus 结果动画的网页优化片段：1000 kg 刚性壁以约 30 km/h 撞击 1 mm 纵梁装配。这里保留动画本身，而不是用静态截图代替。</figcaption>
</figure>

V3 的初始与最终总能量约为 34.72 和 34.70 kJ，整体能量账基本闭合；最终动能为 22.65 kJ。两者相差约 12.07 kJ，表示这部分动能转入模型的其他能量项，但不能在没有重新核对 ODB 分项的情况下把它全部称为内部能或塑性吸能。

V3 仍不是生产级验证。归档建议使用超过 300,000 个增量并以双精度重跑，说明时间离散与精度仍是数值风险。它比 V2 更可信的原因是设置更清楚、没有固定质量缩放且作业完成，并不意味着已经完成网格收敛或所有能量项核验。

## 最终报告中的截面比较是另一组研究

最终 LaTeX 报告还比较了不同截面。它与上面的 V3 版本记录相关，但表中 A、B、D 是一组独立的几何比较，不能把它们的数值直接移植到 V2 的材料曲线上。

报告定义了四个几何概念：Model A 是 1.2/0.8 mm 的基准帽形纵梁；Model B 是统一 1.0 mm；Model C 是统一 2 mm 的多胞截面；Model D 是分段厚度的多胞截面。Model C 没有可用的最终结果，因此不能写成“已评估方案”。真正有数据的是 A、B 和 D：

| 指标 | Model A：1.2/0.8 mm | Model B：统一 1.0 mm | Model D：角部 2 mm、壁面 1 mm |
|---|---:|---:|---:|
| 质量（kg） | 0.727 | 0.683 | 3.397 |
| ALLIE（kJ） | 3.5 | 2.8 | 33.0 |
| 剩余动能（kJ） | 31.0 | 32.0 | 0.5 |
| SEA（kJ/kg） | 4.81 | 4.09 | 9.71 |
| $F_{max}$（kN） | 32.0 | 32.5 | 280 |
| $F_{mean}$（kN） | 11.6 | 7.7 | 264 |
| CFE | 36.2% | 23.7% | 94.3% |
| 最大位移（mm） | 300 | 360 | 125 |

<figure>
  <img src="/images/projects/abaqus-energy-absorber/model-a-energy-history.png" alt="Model A 的动能、内能和人工能量历程" loading="lazy">
  <figcaption>Model A 原始能量历程：0.06 s 时内能约 3.5 kJ，仍保留约 31 kJ 动能。</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/model-b-energy-history.png" alt="Model B 的动能、内能和人工能量历程" loading="lazy">
  <figcaption>Model B 原始能量历程：统一成 1.0 mm 后质量略降，但内能约 2.8 kJ，低于 Model A。</figcaption>
</figure>

两张曲线说明，均匀厚度并没有自动带来更稳定的压溃。Model B 比 A 轻约 6%，但 ALLIE、SEA、平均力和 CFE 都更低。折叠模式取决于塑性铰形成的位置和顺序，而不只取决于平均板厚。

<figure>
  <img src="/images/projects/abaqus-energy-absorber/model-d-energy-history.png" alt="Model D 的动能、内能和人工能量历程" loading="lazy">
  <figcaption>Model D 原始能量历程：内能升至约 33 kJ，末期剩余动能约 0.5 kJ；这仍需与其显著增加的质量和力峰值一起判断。</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/model-d-force-history.png" alt="Model D 在约 0.025 秒后形成的高压溃力平台" loading="lazy">
  <figcaption>Model D 原始力历程：平均力约 264 kN、峰值约 280 kN，因此 94.3% 的 CFE 来自一个很高的力平台，并不等同于更低的乘员载荷。</figcaption>
</figure>

Model D 的确在 125 mm 行程内转化了更多动能，SEA 也高于 A、B，但它不是无需条件的“最优解”。它重 3.397 kg，约为 Model A 的 4.7 倍；280 kN 峰值也远高于 A 的 32 kN。高 CFE 只说明平均力接近峰值，不能单独证明碰撞更安全。

还要区分论文概念与实际模型。Fang 等人的 FGT 方法用连续厚度规律和三个区域描述材料重新分配：角部单元外壁、角部之间的连接外壁和内部筋板，并讨论固定质量下的优化；归档中的 Model D 只明确记录了角部 2 mm、壁面 1 mm 的分段厚度。我们没有找到连续梯度实际写入模型或运行优化算法的证据，因此把 D 称为受 FGT 启发的分段厚度方案更准确。

## 我们能保留的结论

这次复盘留下三条有限但可靠的判断。第一，V1 证明完整的属性检查是显式动力学模型能否起跑的前提。第二，V2 暗示钢、铝之间存在峰值力、绝对吸能和质量效率的折中，但激进质量缩放与 15% 的人工能量使其只能用于探索。第三，V3 提供了目前最清楚的 30 km/h 装配、接触和能量记录；几何比较则说明材料分布会显著改变压溃平台，但 Model D 的吸能提升同时伴随约 4.7 倍质量和很高的峰值力。

如果继续研究，我们会把所有候选方案放到同一速度、同一冲击体、同一可用行程和固定质量预算下比较；进行网格收敛；从 ODB 逐项核对 ALLKE、ALLIE、ALLAE、接触与其他能量；以双精度和更充分的增量重跑；并彻底移除 V2 那种激进的固定质量缩放。完成这些检查之前，这些结果适合展示建模判断和失败修正，不足以支持量产吸能器的设计定案。
