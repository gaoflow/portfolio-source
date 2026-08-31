---
title: '用镜像涡研究地面效应'
year: 2026
date: '2026-04-25'
status: complete
categories: [validation, tooling]
tags: [CFD]
summary: '我写了一个地面效应 VLM 工具'
role: '空气动力学与数值方法'
duration: '独立研究'
featured: false
order: 6
studySequence: 13
heroImage: /images/projects/ground-effect-vlm/reference/faa-wake-vortex-generation.svg
github: 'https://github.com/binggao1230/ground-effect-vlm'
---

## F1 赛车的地面效应

当我们看 F1 时，总会听到“地面效应”的概念。翼面越靠近地面，下压力往往越强。而我比较好奇的问题是：地面明明只是一条平路，它为什么会改变上方翼面的受力？离得太近以后，结果为什么又不再可信？

真车上的底板、轮胎、扩散器和缝隙泄漏会同时影响气流。把整辆车直接放进模型，反而很难看清地面本身做了什么。所以我用镜像涡原理写了一个低阶涡格法（VLM）工具，先研究一张简单的矩形翼。

2022 至 2025 年的 F1 赛车[使用成形的 Venturi 地板隧道加强地面效应](https://www.formula1.com/en/latest/article/10-things-you-need-to-know-about-the-all-new-2022-f1-car.4OLg8DrXyzHzdoGrbqp6ye)：

<figure>
  <img src="/images/projects/ground-effect-vlm/reference/f1-2022-concept.webp" alt="Formula 1 官方发布的 2022 概念车资料图" loading="lazy">
  <figcaption><a href="https://www.formula1.com/en/latest/article/10-things-you-need-to-know-about-the-all-new-2022-f1-car.4OLg8DrXyzHzdoGrbqp6ye">F1 2022 concept car.</a></figcaption>
</figure>

2026 年的新规则[改用更平的地板和更大的扩散器](https://www.formula1.com/en/latest/article/2026-regulations-explained-all-you-need-to-know-about-f1s-new-aerodynamics.7IAt0auc32UkCEFE5ypkTB)。地面效应没有消失，只是比上一代规则弱。下面这张图把视线放在赛车后部，同样只提供背景。

<figure>
  <img src="/images/projects/ground-effect-vlm/reference/f1-2026-rear-floor.webp" alt="Formula 1 官方发布的 2026 赛车后部与地板资料图" loading="lazy">
  <figcaption><a href="https://www.formula1.com/en/latest/article/2026-regulations-explained-all-you-need-to-know-about-f1s-new-aerodynamics.7IAt0auc32UkCEFE5ypkTB">F1 2026 rear floor and diffuser.</a></figcaption>
</figure>

## 把问题简化成一张矩形翼进行研究

假设最简单的模型：一张薄薄的长方形翼，它以固定角度迎着气流。开始时它离地很远，接着一点点下降，其他条件都不变。我想观察三件事：1 载荷沿翼展怎样变化，2 总升力增加多少，3 产生同样升力时需要付出多少诱导阻力。

我没有导入 CAD，也没有照着某一代 F1 赛车建地板，那些都太复杂了，我用了最简单的几何进行初步探索。在代码里，我的翼没有厚度、后掠和扭转。弦长取 $c=1$，翼展取 $b=4c$，迎角固定为 $4^\circ$。这个简化让我只改变离地高度，不把轮胎、扩散器和车身干扰带进来。把翼翻转以后，力的方向变成 F1 所说的下压力；我更关注地面怎样改变载荷，所以力朝上还是朝下不影响这里讨论的近地机制。

由于模型过于简单，我认为只用来观察趋势，它没有黏性和流动分离，因此不能预测真实赛车会在哪个车高失速。

## 涡是什么？又是怎样产生的？

简单说，涡就是一团绕着某个中心打转的空气。空气可以一边向后流，一边绕圈。烟雾、云气和水汽能把旋转显示出来，但烟本身不是涡，它只是跟着空气运动。

机翼产生升力时，上表面压力较低，下表面压力较高。在翼尖附近，下面的高压空气会绕过翼尖，流向上面的低压区域。空气离开机翼后继续卷起，最后形成一左一右、旋转方向相反的两条尾涡。[NASA 对下洗的解释](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/downwash-effects-on-lift/)和 [FAA 的尾流说明](https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap7_section_4.html)描述了这个过程。

为了让形成过程更直观，我问了 AI ，它给我返回了一个非常易懂的动画，我觉得效果非常好，于是也放在这里。动画先画压力差怎样推动翼尖绕流，再画绕流怎样卷成尾涡。

<iframe class="article-demo" src="/labs/ground-effect-vortex/" title="翼尖涡形成动画" loading="lazy"></iframe>

## 那么 VLM 怎样表示一片翼

真实尾流不会自动长成几条笔直的线。VLM 为了降低计算量，用马蹄涡近似一小段翼面产生的升力和下洗。马蹄涡中间横着的一段叫束缚涡，后面两条长线表示尾涡。我沿翼展把矩形翼均匀切成 64 段，每段放一个马蹄涡。束缚涡位于四分之一弦线，检查气流是否穿过翼面的控制点位于四分之三弦线，尾涡向后延伸 80 个弦长。

求解时，每个涡都会影响其他位置的速度。把这些相互影响放在一起，会得到一组联立方程：

$$
A\Gamma=b
$$

矩阵 $A$ 记录各个涡之间的影响，$\Gamma$ 是 64 段上尚未求出的环量。方程右侧的 $b$ 表示边界条件，与前文表示翼展的 $b$ 只是用了同一个字母。解出环量以后，我用 Kutta–Joukowski 定理计算升力，再把环量和尾涡产生的下洗沿翼展加起来，估算诱导阻力。

## 镜像涡怎样表示地面

地面对气流最基本的要求只有一个：**空气不能穿过去。换成速度来讲，就是地面上的垂向速度必须为零。**

我的做法是在地面下方放一套镜像涡。每个镜像涡与上方真实涡的位置对称，环量方向相反。真实涡在地面上产生的垂向速度，会被镜像涡抵消。这样不用给地面划网格，也能满足不可穿透条件。

下图用一个二维涡说明了同样的关系。地面上方的 $\Gamma$ 是真实涡，地面下方的 $-\Gamma$ 是镜像涡，两者到地面的距离都是 $b$。

<figure>
  <img src="/images/projects/ground-effect-vlm/reference/mit-vortex-near-wall.gif" alt="MIT 势流课程中的墙面镜像涡示意图" loading="lazy">
  <figcaption><a href="https://web.mit.edu/fluids-modules/www/potential_flows/LecturesHTML/lec1011/node37.html">MIT method of images.</a></figcaption>
</figure>

我先把翼放到 $h/c=50$，得到几乎不受地面影响的基准。随后逐步降低高度，直到 $h/c=0.25$，一共计算 14 个状态。这里的 $h$ 是四分之一弦线到地面的距离。

## 观察载荷沿翼展怎样变

求出环量以后，我先比较载荷形状。下面每条曲线都除以各自的最大环量，因此只能比较载荷怎样沿翼展分布，不能直接比较总升力大小。

<figure>
  <img src="/images/projects/ground-effect-vlm/span-loading.svg" alt="不同离地高度下的归一化展向载荷" loading="lazy">
  <figcaption>Normalised span loading.</figcaption>
</figure>

离地高度降低后，曲线在靠近翼尖的位置变得更饱满。地面不只是放大总载荷，也改变了载荷沿翼展的分配方式。

## 把三个数分开看

左图看固定迎角下的升力相对自由空间增加多少，右图看单位升力对应的诱导阻力代价怎样变化。横轴都是 $h/c$，数值越小，翼越靠近地面。

<figure>
  <img src="/images/projects/ground-effect-vlm/ground-sweep.svg" alt="离地高度变化时的升力放大与单位升力诱导阻力代价" loading="lazy">
  <figcaption>Ride-height sweep.</figcaption>
</figure>

自由空间基准为 $C_L=0.2615$、$C_{D_i}=0.00549$。翼降到 $h/c=0.5$ 后，$C_L$ 增加 32.4%，达到 0.3461。绝对诱导阻力只增加 1.7%，变成 0.00559。与此同时，$C_{D_i}/C_L^2$ 下降 41.9%。

简单来说，第三个数降得很多，主要是因为分母 $C_L^2$ 变大了，并不代表绝对阻力下降。所以我可以得出，同样多的升力时，诱导阻力代价更低。但 “翼一靠近地面，绝对阻力就会下降” 这一结论还不符合。

## 数据偏差

得到趋势以后，我又一次检查镜像涡是否真的挡住了地面，再检查翼离地很远时能否回到自由空间，最后检查理论量级、面元细化和左右对称性。用 chatgpt 帮我比较偏差：

| 检查内容 | 结果 | 要求 |
|---|---:|---:|
| 地面法向速度残差 | 0.0 | $<10^{-12}$ |
| $h/c=50$ 与自由空间升力差异 | 0.00335% | $<0.1$% |
| 相对 Prandtl 估算的升力斜率差异 | 11.01% | $<12$% |
| 面元数从 64 增至 96 的升力变化 | 0.258% | $<1$% |
| 左右载荷对称误差 | $1.94\times10^{-16}$ | $<10^{-12}$ |

求解器还在地面上的 27 个点直接检查垂向速度，取样位置由 3 个流向坐标和 9 个展向坐标组成。残差为零，说明镜像边界按预期工作。$h/c=50$ 与自由空间只差 0.00335%，说明地面影响在远处消失。

下面的左图比较自由空间升力斜率与 Prandtl 估算，右图检查 $h/c=1$ 时增加面元数后结果是否稳定。

<figure>
  <img src="/images/projects/ground-effect-vlm/verification.svg" alt="自由空间升力斜率和展向面元细化检查" loading="lazy">
  <figcaption>Solver verification.</figcaption>
</figure>

升力线斜率仍有 11.01% 的差异。我没有用校准把它抹掉。面元从 64 增加到 96 时，升力只变化 0.258%，说明继续加密面元也消不掉这部分差距。我觉得这主要来自模型本身的简化。

## 对最低高度的疑虑

$h/c=0.25$ 时，模型给出 $C_L=0.5419$，是自由空间的 2.07 倍，传统展向效率指标达到 2.59。

镜像涡在线性模型里没有流动分离这道限制。高度继续降低，数字只会越来越大，但模型并没有增加新的真实物理。传统自由空间效率表达式在这里超过一，是因为地面改变了边界条件。这个值只能用来比较趋势，不能按普通航空器的 Oswald 效率理解。

所以我把 $h/c=0.25$ 设为扫描下限。它是我主动停止外推的位置，不是实验确认的失效高度。这个模型既不能解释真实分离和失速，也不能判断它们会在哪个车高出现。

## 总结

我设计的这套模型，假设是稳态、不可压缩、无黏和零厚度的。它没有道路边界层、车身阻塞、压力恢复和流动分离。我只把它当成检查方向、数量级和数值流程的低成本工具。对于真是情况、真实赛车，研究要比我这个复杂的非常多，比如还需要加入有限厚度、弦向载荷、运动地面边界层、车高和俯仰变化、轮胎、泄漏、扩散器、网格敏感性和流动分离等等一系列因素。

## 代码与运行

本项目已开源在 GitHub：[binggao1230/ground-effect-vlm](https://github.com/binggao1230/ground-effect-vlm)

```bash
git clone https://github.com/binggao1230/ground-effect-vlm.git
cd ground-effect-vlm
python3 -m unittest discover -s tests -v
python3 scripts/analyse.py
```
