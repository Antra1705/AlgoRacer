
// --- ARRAY ALGORITHMS ---

export const mergeSort = (arr) => {
  let operations = 0;
  const merge = (left, right) => {
    let result = [];
    let l = 0; let r = 0;
    while (l < left.length && r < right.length) {
      operations++; 
      if (left[l] < right[r]) { result.push(left[l]); l++; }
      else { result.push(right[r]); r++; }
      operations++; 
    }
    const remL = left.slice(l); const remR = right.slice(r);
    result = [...result, ...remL, ...remR];
    operations += remL.length + remR.length;
    return result;
  };
  const sort = (array) => {
    if (array.length <= 1) return array;
    const mid = Math.floor(array.length / 2);
    return merge(sort(array.slice(0, mid)), sort(array.slice(mid)));
  };
  sort([...arr]);
  return { name: 'Merge Sort', operations };
};

export const quickSort = (arr) => {
  let operations = 0;
  const sort = (array) => {
    if (array.length <= 1) return array;
    const pivot = array[array.length - 1];
    const left = []; const right = [];
    for (let i = 0; i < array.length - 1; i++) {
      operations++; 
      if (array[i] < pivot) left.push(array[i]);
      else right.push(array[i]);
      operations++; 
    }
    operations++; 
    return [...sort(left), pivot, ...sort(right)];
  };
  sort([...arr]);
  return { name: 'Quick Sort', operations };
};

// --- GRAPH ALGORITHMS ---

export const bfs = (adj, V, E) => {
  let operations = 0;
  const visited = new Set();
  const queue = [0]; 
  visited.add(0);
  operations++; 

  while (queue.length > 0) {
    const node = queue.shift();
    operations++; 
    
    const neighbors = adj[node] || [];
    for (const neighbor of neighbors) {
      operations++; 
      if (!visited.has(neighbor.to)) {
        visited.add(neighbor.to);
        queue.push(neighbor.to);
        operations += 2; 
      }
    }
  }
  return { name: 'BFS', operations };
};

export const dijkstra = (adj, V, E) => {
  let operations = 0;
  const dist = new Array(V).fill(Infinity);
  const visited = new Array(V).fill(false);
  dist[0] = 0;
  operations += V * 2 + 1; 

  for (let i = 0; i < V; i++) {
    let u = -1;
    for (let j = 0; j < V; j++) {
      operations++; 
      if (!visited[j] && (u === -1 || dist[j] < dist[u])) {
        u = j;
        operations++;
      }
    }

    if (dist[u] === Infinity) break;
    visited[u] = true;
    operations++; 
    const neighbors = adj[u] || [];
    for (const neighbor of neighbors) {
      operations++; 
      if (dist[u] + neighbor.weight < dist[neighbor.to]) {
        dist[neighbor.to] = dist[u] + neighbor.weight;
        operations++; 
      }
    }
  }
  return { name: 'Dijkstra', operations };
};

// --- STRING MATCHING ---

export const naiveStringMatch = (text, pattern) => {
  let operations = 0;
  const n = text.length;
  const m = pattern.length;

  for (let i = 0; i <= n - m; i++) {
    let j;
    for (j = 0; j < m; j++) {
      operations++; 
      if (text[i + j] !== pattern[j]) break;
    }
    if (j === m) {
      operations++;
    }
  }
  return { name: 'Naïve Matching', operations };
};

export const kmpMatch = (text, pattern) => {
  let operations = 0;
  const n = text.length;
  const m = pattern.length;

  const lps = new Array(m).fill(0);
  let len = 0;
  let i = 1;
  while (i < m) {
    operations++;
    if (pattern[i] === pattern[len]) {
      len++;
      lps[i] = len;
      i++;
      operations += 2; 
    } else {
      if (len !== 0) {
        len = lps[len - 1];
        operations++; 
      } else {
        lps[i] = 0;
        i++;
        operations += 2; 
      }
    }
  }

  // Search
  let txtIdx = 0;
  let patIdx = 0;
  while (txtIdx < n) {
    operations++; 
    if (pattern[patIdx] === text[txtIdx]) {
      txtIdx++;
      patIdx++;
      operations += 2;
    }
    if (patIdx === m) {
      operations++; 
      patIdx = lps[patIdx - 1];
    } else if (txtIdx < n && pattern[patIdx] !== text[txtIdx]) {
      if (patIdx !== 0) {
        patIdx = lps[patIdx - 1];
        operations++;
      } else {
        txtIdx++;
        operations++;
      }
    }
  }
  return { name: 'KMP Algorithm', operations };
};

// --- DYNAMIC PROGRAMMING ---


export const knapsack01 = (weights, values, capacity) => {
  let operations = 0;
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));
  operations += (n + 1) * (capacity + 1); 

  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= capacity; w++) {
      operations++; 
      if (weights[i - 1] <= w) {
        operations++; 
        dp[i][w] = Math.max(values[i - 1] + dp[i - 1][w - weights[i - 1]], dp[i - 1][w]);
      } else {
        dp[i][w] = dp[i - 1][w];
        operations++; 
      }
    }
  }
  return { name: '0/1 Knapsack', operations };
};

export const longestCommonSubsequence = (s1, s2) => {
  let operations = 0;
  const n = s1.length;
  const m = s2.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  operations += (n + 1) * (m + 1);

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      operations++; 
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = 1 + dp[i - 1][j - 1];
        operations++; 
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        operations++; 
      }
    }
  }
  return { name: 'LCS', operations };
};

// --- GREEDY ALGORITHMS ---

export const fractionalKnapsack = (items, capacity) => {
  let operations = 0;
  
  const data = items.map(it => {
    operations++; 
    return { ...it, ratio: it.val / it.weight };
  });

  
  data.sort((a, b) => {
    operations++; 
    return b.ratio - a.ratio;
  });

  let totalValue = 0;
  let currCapacity = capacity;

  for (const item of data) {
    operations++; 
    if (currCapacity <= 0) break;

    if (item.weight <= currCapacity) {
      currCapacity -= item.weight;
      totalValue += item.val;
      operations += 2; 
    } else {
      const fraction = currCapacity / item.weight;
      totalValue += item.val * fraction;
      currCapacity = 0;
      operations += 3; 
    }
  }
  return { name: 'Fractional Knapsack', operations };
};

export const huffmanCoding = (freqs) => {
  let operations = 0;

  let nodes = freqs.map(f => {
    operations++; 
    return { freq: f };
  });

  while (nodes.length > 1) {
    operations++; 

    
    nodes.sort((a, b) => {
      operations++; 
      return a.freq - b.freq;
    });

    const left = nodes.shift();
    const right = nodes.shift();
    operations += 2; 

    const parent = {
      freq: left.freq + right.freq,
      left,
      right
    };
    nodes.push(parent);
    operations++; 
  }

  return { name: 'Huffman Coding', operations };
};

// --- BACKTRACKING ALGORITHMS ---

export const nQueens = (n) => {
  let operations = 0;
  const board = Array.from({ length: n }, () => new Array(n).fill('.'));

  const isSafe = (row, col) => {
    
    for (let i = 0; i < n; i++) {
        operations++; 
        if (board[row][i] === 'Q' || board[i][col] === 'Q') return false;
    }
    
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            operations++; 
            if (board[i][j] === 'Q' && (Math.abs(row - i) === Math.abs(col - j))) return false;
        }
    }
    return true;
  };

  const solve = (col) => {
    if (col >= n) return true;
    for (let i = 0; i < n; i++) {
      operations++; 
      if (isSafe(i, col)) {
        board[i][col] = 'Q';
        operations++; 
        if (solve(col + 1)) return true;
        board[i][col] = '.'; 
        operations++;
      }
    }
    return false;
  };

  solve(0);
  return { name: 'N-Queens', operations };
};

export const sudokuSolver = (n) => {
  let operations = 0;
  const board = Array.from({ length: 9 }, () => new Array(9).fill(0));
  
  
  const emptyCells = Math.min(n, 81);

  const isValid = (row, col, num) => {
    for (let x = 0; x < 9; x++) {
      operations++; 
      if (board[row][x] === num || board[x][col] === num) return false;
    }
    const startRow = row - (row % 3), startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        operations++; 
        if (board[i + startRow][j + startCol] === num) return false;
      }
    }
    return true;
  };

  const solve = () => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            operations++; 
            if (isValid(row, col, num)) {
              board[row][col] = num;
              operations++; 
              if (solve()) return true;
              board[row][col] = 0; 
              operations++;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  solve();
  return { name: 'Sudoku Solver', operations };
};
