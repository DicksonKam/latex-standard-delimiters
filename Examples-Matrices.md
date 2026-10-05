# Matrix equation examples

These versions preserve standard display delimiters, double-backslash row breaks, and subscripts. They reconstruct the intended equations from the supplied examples. The first groups its bracket expression so MathJax retains it.

Grouping the leading bracket expression prevents aligned from consuming it as an optional alignment argument.

## cylindrical-aligned

\[
\begin{aligned}
{[\mathbf r]}_{\mathrm{cyl}}
&=M(x,y)
\begin{pmatrix}x\\y\\z\end{pmatrix}\\
&=
\begin{pmatrix}
\dfrac{x^2+y^2}{\sqrt{x^2+y^2}}\\
\dfrac{-yx+xy}{\sqrt{x^2+y^2}}\\
z
\end{pmatrix}\\
&=
\begin{pmatrix}\rho\\0\\z\end{pmatrix}
\end{aligned}
\]

## boxed-transformation

\[
\boxed{
\begin{pmatrix}
A_\rho\\
A_\phi\\
A_z
\end{pmatrix}
=
\underbrace{
\begin{pmatrix}
\dfrac{x}{\sqrt{x^2+y^2}}&\dfrac{y}{\sqrt{x^2+y^2}}&0\\
-\dfrac{y}{\sqrt{x^2+y^2}}&\dfrac{x}{\sqrt{x^2+y^2}}&0\\
0&0&1
\end{pmatrix}
}_{M(x,y)}
\begin{pmatrix}
A_x\\
A_y\\
A_z
\end{pmatrix}
}
\]
