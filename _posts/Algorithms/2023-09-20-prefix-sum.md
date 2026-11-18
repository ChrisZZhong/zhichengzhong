---
layout: post
title: "Prefix Sum Problems: Arrays and Matrices"
date: 2023-08-07
description: "Prefix Sum problems"
tag: Algorithms
subcategory: LeetCode Problems
---

# Prefix Sum problems

| LeetCode                                                                           | 难度 |
| ---------------------------------------------------------------------------------- | ---- |
| [724. Find Pivot Index](https://leetcode.com/problems/find-pivot-index)            | 🟢   |
| [560. Subarray Sum Equals K](https://leetcode.com/problems/subarray-sum-equals-k/) | 🟡   |

## 724. Find Pivot Index

### Description

Given an array of integers `nums`, calculate the **pivot index** of this array.

The **pivot index** is the index where the sum of all the numbers **strictly** to the left of the index is equal to the sum of all the numbers **strictly** to the index's right.

If the index is on the left edge of the array, then the left sum is 0 because there are no elements to the left. This also applies to the right edge of the array.

Return the **leftmost pivot index**. If no such index exists, return -1.

```
Input: nums = [1,7,3,6,5,6]
Output: 3
Explanation:
The pivot index is 3.
Left sum = nums[0] + nums[1] + nums[2] = 1 + 7 + 3 = 11
Right sum = nums[4] + nums[5] = 5 + 6 = 11
```

```
Input: nums = [1,2,3]
Output: -1
Explanation:
There is no index that satisfies the conditions in the problem statement.
```

```
Input: nums = [2,1,-1]
Output: 0
Explanation:
The pivot index is 0.
Left sum = 0 (no elements to the left of index 0)
Right sum = nums[1] + nums[2] = 1 + -1 = 0
```

### Solution

第一眼看上去是 prefix sum，但是其实不需要

我的 Prefix sum 的解法如下：维护一个 leftsum，然后遍历数组，每次加上当前元素，然后判断是否 leftsum == presum - nums[i] - leftsum，相等则返回当前下标

```java
class Solution {
    public int pivotIndex(int[] nums) {
        int presum = 0;
        //数组的和
        for (int x : nums) {
           presum += x;
        }
        int leftsum = 0;
        for (int i = 0; i < nums.length; ++i) {
            //发现相同情况
            if (leftsum == presum - nums[i] - leftsum) {
                return i;
            }
            leftsum += nums[i];
        }
        return -1;
    }
}
```

**Better solution:**

设 `total` 为数组所有元素的和，左侧元素和为`sum` 则右侧为`total - sum - nums[i]`

则 **sum = total - sum - nums[i]** 即满足 **2 \* sum + nums[i] = total** 即可，不必用 prefix sum 去判断左右

```java
class Solution {
    public int pivotIndex(int[] nums) {
        int total = Arrays.stream(nums).sum();
        int sum = 0;
        for (int i = 0; i < nums.length; ++i) {
            if (2 * sum + nums[i] == total) {
                return i;
            }
            sum += nums[i];
        }
        return -1;
    }
}
```

## 560. Subarray Sum Equals K

### Description

Given an array of integers `nums` and an integer `k`, return _the total number of continuous subarrays whose sum equals to `k`_.

```
Input: nums = [1,1,1], k = 2
Output: 2
-1000 <= nums[i] <= 1000
```

这里注意，题目中的数组元素有负数，所以不能用滑动窗口，因为滑动窗口只能用于正数。

若数组元素都是正数，则可以用滑动窗口，因为窗口内的和是递增的，所以可以用双指针来滑动窗口

```java
class Solution {
    public int subarraySum(int[] nums, int k) {
        int res = 0;
        int preLeft = 0;
        int preRight = 0;
        int l =  0;
        for (int r = 0; r < nums.length; r++) {
            preRight += nums[r];
            while (l <= r && preRight - preLeft >= k) {
                if (preRight - preLeft == k) res++;
                preLeft += nums[l++];
            }
        }
        return res;
    }
}
```

但是这里有负数，所以不能用滑动窗口，而是用 prefix sum + hashmap， 详解见 [solution](https://leetcode.cn/problems/subarray-sum-equals-k/solutions/238572/he-wei-kde-zi-shu-zu-by-leetcode-solution/)

```java
class Solution {
    public int subarraySum(int[] nums, int k) {
        int res = 0;
        int presum = 0;
        Map<Integer, Integer> map = new HashMap<>();
        map.put(0, 1);
        for (int i = 0; i < nums.length; ++i) {
            presum += nums[i];
            if (map.containsKey(presum - k)) {
                res += map.get(presum - k);
            }
            map.put(presum, map.getOrDefault(presum, 0) + 1);
        }
        return res;
    }
}
```


## Matrix Prefix Sum

```java
int[][] pre;
public void build(int[][] grid) {
    int n = grid.length;
    int m = grid[0].length;
    pre = new int[n + 1][m + 1];
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            pre[i + 1][j + 1] = pre[i][j + 1] + pre[i + 1][j] - pre[i][j] + grid[i][j];
        }
    }
}
```

## Calculate Matrix Area

```java
public int calculate(int a, int b, int c, int d) {
    return pre[c + 1][d + 1] - pre[a][d + 1] - pre[c + 1][b] + pre[a][b];
}
```

## Prefix sums for absolute distances

Sort the positions or values, then use prefix sums to compute the total distance on either side of a target. The first problem uses binary search to find the split. The second groups equal values and applies the same calculation to each group's indices.

## [2602. Minimum Operations to Make All Array Elements Equal](https://leetcode.cn/problems/minimum-operations-to-make-all-array-elements-equal/description/)

<img src="https://pic.leetcode.cn/1679808210-FVsAou-t3.png">

```Java

Input: nums = [3,1,6,8], queries = [1,5]
Output: [14,10]
Explanation: For the first query we can do the following operations:
- Decrease nums[0] 2 times, so that nums = [1,1,6,8].
- Decrease nums[2] 5 times, so that nums = [1,1,1,8].
- Decrease nums[3] 7 times, so that nums = [1,1,1,1].
So the total number of operations for the first query is 2 + 5 + 7 = 14.
For the second query we can do the following operations:
- Increase nums[0] 2 times, so that nums = [5,1,6,8].
- Increase nums[1] 4 times, so that nums = [5,5,6,8].
- Decrease nums[2] 1 time, so that nums = [5,5,5,8].
- Decrease nums[3] 3 times, so that nums = [5,5,5,5].
So the total number of operations for the second query is 2 + 4 + 1 + 3 = 10.

Solution：
    1）先sort，把队列变成升序，
    2）然后二分法找到target，使得target左边是需要加，右边需要减。
    3）用prefix sum得出左边的加总和右边的加总

class Solution {
    public List<Long> minOperations(int[] nums, int[] queries) {
        Arrays.sort(nums);
        int n = nums.length;
        long[] sum = new long[n + 1]; // 前缀和
        for (int i = 0; i < n; i++) {
            sum[i + 1] = sum[i] + nums[i];
        }

        List<Long> ans = new ArrayList<>(queries.length);
        for (int q : queries) {
            int j = lowerBound(nums, q);
            long left = (long) q * j - sum[j]; // 蓝色面积
            long right = sum[n] - sum[j] - (long) q * (n - j); // 绿色面积
            ans.add(left + right);
        }
        return ans;
    }

    // 见 https://www.bilibili.com/video/BV1AP41137w7/
    private int lowerBound(int[] nums, int target) {
        int left = -1;
        int right = nums.length; // 开区间 (left, right)
        while (left + 1 < right) { // 区间不为空
            // 循环不变量：
            // nums[left] < target
            // nums[right] >= target
            int mid = left + (right - left) / 2;
            if (nums[mid] < target) {
                left = mid; // 范围缩小到 (mid, right)
            } else {
                right = mid; // 范围缩小到 (left, mid)
            }
        }
        return right;
    }
}

```

## [2615. Sum of Distances](https://leetcode.cn/problems/sum-of-distances/description/)

```Java
Input: nums = [1,3,1,1,2]
Output: [5,0,3,4,0]
Explanation:
When i = 0, nums[0] == nums[2] and nums[0] == nums[3]. Therefore, arr[0] = |0 - 2| + |0 - 3| = 5.
When i = 1, arr[1] = 0 because there is no other index with value 3.
When i = 2, nums[2] == nums[0] and nums[2] == nums[3]. Therefore, arr[2] = |2 - 0| + |2 - 3| = 3.
When i = 3, nums[3] == nums[0] and nums[3] == nums[2]. Therefore, arr[3] = |3 - 0| + |3 - 2| = 4.
When i = 4, arr[4] = 0 because there is no other index with value 2.

Solution: 实际上找的是相等元素之间的距离和
    1）找出每个相等元素的index的list
    2）对于每个list中的元素index，距离实际上就是把其他元素的index变成当前元素的index需要的操作数，这样套上个题目的模板即可

class Solution {
    public long[] distance(int[] nums) {
        int n = nums.length;
        var groups = new HashMap<Integer, List<Integer>>();
        for (int i = 0; i < n; ++i) // 相同元素分到同一组，记录下标
            groups.computeIfAbsent(nums[i], k -> new ArrayList<>()).add(i);

        var ans = new long[n];
        var s = new long[n + 1];
        for (var a : groups.values()) {
            int m = a.size();
            for (int i = 0; i < m; ++i)
                s[i + 1] = s[i] + a.get(i); // 前缀和
            for (int i = 0; i < m; ++i) {
                int target = a.get(i);
                long left = (long) target * i - s[i]; // 蓝色面积
                long right = s[m] - s[i] - (long) target * (m - i); // 绿色面积
                ans[target] = left + right;
            }
        }
        return ans;
    }
}
```
