---
title: '一套会挑错的无量纲数工具'
year: 2025
date: '2025-10-18'
status: complete
categories: [tooling]
tags: [CFD]
summary: '我做了一套能检查单位、拒绝不合理输入、并把验证过程留下来的小工具。'
role: '个人研究项目'
duration: '独立开发'
featured: false
order: 11
studySequence: 1
heroImage: /images/projects/dimensionless-numbers/source/reynolds-observations-1883.svg
github: 'https://github.com/binggao1230/dimensionless-numbers'
---

## 从雷诺玻璃管实验说起

这是我刚入学给自己安排的第一个研究项目。起因不是代码，而是一个 140 多年前的实验。

刚开始接触流体力学这门课之后，我了解到在 1883 年，雷诺（Osborne Reynolds）做了一个很经典的实验。他往一根玻璃管里通水，同时在水里注入一丝染料。流速慢的时候，染料拉成一条笔直的细线；把阀门开大，流速提上去，染料突然散开，和周围的水混成一片。

让我感兴趣的是他接下来的判断：流态会不会突变，不取决于速度、管径、黏度里任何一个单独的量，而取决于它们组合起来的一个比例。这个比例后来就以他的名字命名：

$$
Re=\frac{\rho uL}{\mu}
$$

同样的水、同样的管子，只把速度调大，流动就换了一副面孔，而这个比例能告诉你大概会在什么位置发生转捩。这个思想是我第一次看到，先把几个物理量放进同一把尺子，然后再计算。

再想象这样一个场景：一台小风扇以大约 3 m/s 的速度，吹过一张 15 cm 宽的卡片。代入海平面空气的密度 $\rho=1.225\ \mathrm{kg/m^3}$ 和动力黏度 $\mu=1.81\times10^{-5}\ \mathrm{Pa\cdot s}$：

$$
Re=\frac{1.225\times3\times0.15}{1.81\times10^{-5}}
\approx3.05\times10^4.
$$

这个结果没有单位，它就是“流体往前冲的惯性”和“黏性把流动抹平的能力”之间的比值。真正好用的地方在于：风扇、赛车翼、整车看起来完全不是一回事，却可以放进同一个比值里比大小。

![三条长度尺度下雷诺数随速度的变化](/images/projects/dimensionless-numbers/reynolds-sweep.svg)

*速度和长度一起决定雷诺数的量级，三条曲线分别取 0.3 m 翼弦、1 m 侧箱和 5 m 整车*

我画了一个示意图，同样是海平面空气，0.3 m 翼弦在 15 m/s 时 $Re\approx3\times10^5$，5 m 长的整车在 60 m/s 时 $Re\approx2\times10^7$，差了几十倍。雷诺数差得远，流动就不是一回事。
## 于是我写了第一个小工具

所以对每个新问题下手之前，都得先算一算这些数，搞清楚自己处在哪个尺度、哪些效应重要。不管要算赛车翼上的气流，还是冷却水的换热，第一步都是要做这件事情。于是我干脆就把最常用的六个做成了一个 Python 小工具：

| 无量纲数 | 它帮我先判断什么 |
|---|---|
| 雷诺数（Reynolds） | 惯性和黏性谁占上风 |
| 马赫数（Mach） | 压缩性要不要考虑 |
| 普朗特数（Prandtl） | 动量扩散和热扩散哪个快 |
| 努塞尔数（Nusselt） | 对流换热比纯导热强多少 |
| 格拉晓夫数（Grashof） | 浮力相对黏性的强弱 |
| 瑞利数（Rayleigh） | 自然对流值不值得考虑 |

公式都只有一行，真正容易出错的是输入。比如动力黏度和运动黏度，数值上都在 $10^{-5}$ 附近，一旦放错位置，普通计算器照样给你一个很像答案的数字。所以我给工具加了两道检查：

- 单位检查：每个输入都要声明单位，动力黏度的位置放进了运动黏度，程序立刻停下并指出问题；
- 范围检查：密度、黏度必须是正数，速度不能是负的，物性查表超出温度范围就报错，不外推。

我还构造了 10 个错误调用，10 个全部被拦住；一个单位完整的正常调用则顺利通过。物性数据也做了同样的小心处理：我从教材附录里录了五个温度锚点（空气 300–400 K 三个，水 300–320 K 两个），锚点之间线性插值，范围外拒绝外推。查表结果在 20 个字段上都精确回到录入值。

验证瑞利数时，我差点犯一个错。瑞利数有个恒等式 $Ra=Gr\cdot Pr$，如果让程序直接拿 Grashof 乘 Prandtl 当结果，再测试“两边相等”，这个测试就永远通过，因为这相当于拿自己跟自己比，两边共享的错误根本暴露不出来。所以我让瑞利数按展开式单独计算，再和 $Gr\times Pr$ 对账。500 组固定随机输入跑下来，两条独立路径最差也只差 $4.4\times10^{-16}$。

## 代码

源代码和测试在 [binggao1230/dimensionless-numbers](https://github.com/binggao1230/dimensionless-numbers)：

```bash
git clone https://github.com/binggao1230/dimensionless-numbers.git
cd dimensionless-numbers
python3 -m unittest discover -s tests -v
python3 scripts/analyse.py
```
