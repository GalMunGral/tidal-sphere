# Tidal Sphere

**Live demo:** https://galmungral.github.io/tidal-sphere/

## Rhetorical Design

### Goal

For a general audience, we explore what force-directed graph layout looks like
when the graph is embedded in $\mathbb{R}^3$ on a closed surface, rather than
in the plane.

### Challenge

Force-directed layout is typically demonstrated in $\mathbb{R}^2$. Embedding a
graph on a closed surface introduces a qualitatively different behavior —
analogous to surface tension — that is difficult to convey without an
interactive 3D visualization.

### Strategy

Every triangular mesh is a graph: its vertices and edges form the 1-skeleton,
embedded in $\mathbb{R}^3$. We use a subdivided icosahedron as the graph — a
closed surface (compact, without boundary) homeomorphic to $S^2$, as opposed
to a surface with boundary homeomorphic to $D^2 = \{x \in \mathbb{R}^2 : \|x\| \leq 1\}$.
The springs between adjacent vertices create surface tension; orbiting source
spheres attract and repel vertices, producing tidal deformations that visibly
follow each source across the surface.

## Technical Challenges

### Force-directed layout on a mesh

**Problem.** Vertices must be updated each frame under the combined influence
of pairwise repulsion, spring attraction along edges, and external source
forces, without the surface collapsing or exploding.

**Model.** Each vertex $p$ accumulates a force

```math
F(p) = \sum_{q \neq p} f_\text{rep}(p, q) + \sum_{q \in N(p)} f_\text{att}(p, q) + \sum_{s} f_\text{src}(p, s)
```

where $N(p)$ is the set of neighbors of $p$ in the mesh graph, and $s$ ranges
over the source spheres.

**Algorithm.** Forces use standard inverse-square repulsion and linear spring
attraction. Source forces apply the same laws with separate strength
parameters. Force magnitudes are clamped each frame to prevent instability.