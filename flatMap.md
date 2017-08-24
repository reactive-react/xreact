flatMap is simply `flatten` compose `map`

imaging when you

1. map an Array `[1,2,3]` with function `x=>[x]`, you'll get `[[1],[2],[3]]`
2. `flatten` will flatten the nested array into a flat array `[1,2,3]`

same thing happen to Stream

1. map `--1--2--3-->` with function `x=>Stream(x+1)` will return `--S(1+1)--S(2+1)--S(3+1)-->`
2. so if `S(1+1)` represent as `--2-->`, `flatten` will flatten the nested Stream into flat Stream `----2----3----4-->`

> ref to [[Notation]] if these symbols make no sense to you.
