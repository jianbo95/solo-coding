import Utils from './utils.js';

export default class OverlapRegionStrategy {
    constructor(debug = false) {
        this.debug = debug;
        this.utils = new Utils();
        this.log = (...args) => {
            if (this.debug) {
                console.log(...args);
            }
        };
    }

    analyze(grid, rows, cols, revealedCells) {
        const regions = new Map();
        const centerNodeRegions = new Map();

        // 遍历所有已揭示的数字格子
        for (const cell of revealedCells) {
            const { row, col } = cell;
            
            if (!grid[row][col].revealed || grid[row][col].isMine) continue;
            
            const value = grid[row][col].adjacentMines;
            if(value === 0) continue;

            // 获取这个中心节点周围所有的未揭示格子
            const unrevealedNeighbors = this.utils.getUnrevealedNeighbors(grid, rows, cols, row, col);
            if (unrevealedNeighbors.length === 0) continue;

            // 检查现有的区域，看是否是这个中心节点的子集
            regions.forEach((region, key) => {
                // 检查region的所有节点是否都在当前中心节点的周围
                const isSubset = region.nodes.every(node => 
                    unrevealedNeighbors.some(n => n.row === node.row && n.col === node.col)
                );
                
                if (isSubset) {
                    const currentCount = value - this.utils.countFlagsAroundCells(grid, [{row, col}]);
                    region.counts.add(currentCount);
                    region.centers.push({ row, col, value, count: currentCount });
                }
            });

            // 创建新的区域
            const regionKey = unrevealedNeighbors
                .map(n => `${n.row},${n.col}`)
                .sort()
                .join('|');

            if (!regions.has(regionKey)) {
                const currentCount = value - this.utils.countFlagsAroundCells(grid, [{row, col}]);
                regions.set(regionKey, {
                    nodes: unrevealedNeighbors,
                    counts: new Set([currentCount]),
                    centers: [{ row, col, value, count: currentCount }]
                });
            }
        }

        // 打印叠加区域和中心节点的关系
        this.log('\n=== 叠加区域分析 ===');
        regions.forEach((region, key) => {
            this.log('\n叠加区域:', region.nodes.map(n => `(${n.row}, ${n.col})`).join(', '));
            this.log('相关的中心节点:');
            region.centers.forEach(center => {
                this.log(`  (${center.row}, ${center.col}) 值: ${center.value}, 需要的雷数: ${center.count}`);
            });
        });
        // 可以根据叠加区域找到所有的中心节点了
        // 现在还需要根据中心节点找到所有的叠加区域
        let centerList = [];
        regions.forEach((region, key) => {
            region.centers.forEach(center => {
                if (!centerNodeRegions.has(center)) {
                    centerNodeRegions.set(center, []);
                }
                centerNodeRegions.get(center).push(region);
                // 获取所有中心节点
                centerList.push(center);
            });
        });

        // 对中心节点去重
        const uniqueCenters = new Map();
        centerList.forEach(center => {
            const key = `${center.row},${center.col}`;
            if (!uniqueCenters.has(key)) {
                uniqueCenters.set(key, {
                    center: center,
                    regions: new Set()
                });
            }
            centerNodeRegions.get(center).forEach(region => {
                uniqueCenters.get(key).regions.add(region);
            });
        });

        // 打印所有中心节点及其叠加区域
        this.log('\n=== 中心节点分析 ===');
        uniqueCenters.forEach((data, key) => {
            this.log(`\n中心节点 (${data.center.row}, ${data.center.col}) 值: ${data.center.value}`);
            this.log('关联的叠加区域:');
            Array.from(data.regions).forEach((region, index) => {
                this.log(`  区域 ${index + 1}:`);
                this.log(`    格子: ${region.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')}`);
                this.log(`    需要的雷数: ${data.center.count}`);
            });
        });

        // 现在我们有了所有的中心节点及其关联的叠加区域
        // 举个例子
        // 中心节点 (1, 2) 值: 1
        // 关联的叠加区域:
        //   区域 1:
        //     格子: (0, 3), (1, 3)
        //     需要的雷数: 1
        //   区域 2:
        //     格子: (0, 3), (1, 3), (2, 3)
        //     需要的雷数: 1
        // 区域2包含了区域1，区域2减去区域1，得到一个新的叠加区域
        // 这个叠加区域的雷数是 1-1 = 0 同时这个叠加区域只有一个格子，如果新的叠加区域有多个格子，那就取一个格子，它也一定不是雷
        // 这个格子就是节点 (2, 3)，所以 (2, 3) 不是雷
        // 分析包含关系的区域
        
        // 尝试无雷推断
        const noMineResult = this.analyzeNoMineRegions(Array.from(uniqueCenters));
        if (noMineResult) return this.utils.verifyResult(noMineResult, grid, '无雷');

        // 尝试有雷推断
        // const hasMineResult = this.analyzeHasMineRegions(Array.from(uniqueCenters));
        // if (hasMineResult) return this.utils.verifyResult(hasMineResult, grid, '有雷');

        // 叠加区域可以组合在一起获得新的叠加区域
        // 通过取交集获得新的叠加区域，当新的叠加区域格子数大于2时有效
        // 再判断新的叠加区域属于哪个中心节点
        // 然后再重复之前的逻辑去做有雷和无雷推断
        // 尝试通过区域交集进行推断
        // 尝试通过区域交集进行推断
        // const intersectionResult = this.analyzeIntersectionRegions(Array.from(uniqueCenters), grid, rows, cols);
        // if (intersectionResult) {
        //     console.log('通过区域交集进行推断');
        //     return this.utils.verifyResult(intersectionResult, grid, '区域交集');
        // } 

        // 叠加区域可以组合在一起获得新的叠加区域
        // 通过取并集获得新的叠加区域，但是并集有个条件，就是这两个叠加区域属于同一个中心节点
        // 再判断新的叠加区域属于哪个中心节点
        // 然后再重复之前的逻辑去做有雷和无雷推断
        // 尝试通过区域并集进行推断
        // 尝试通过区域并集进行推断
        // const unionResult = this.analyzeUnionRegions(Array.from(uniqueCenters), grid, rows, cols);
        // if (unionResult) {
        //     console.log('通过区域并集进行推断');
        //     return this.utils.verifyResult(unionResult, grid, '区域并集');
        // }

        return null;
    }

    analyzeUnionRegions(centersList, grid, rows, cols) {
        // 对每个中心节点分别处理
        for (const [centerKey, data] of centersList) {
            const regions = Array.from(data.regions);
            
            // 比较同一个中心节点下的每对区域
            for (let i = 0; i < regions.length; i++) {
                for (let j = i + 1; j < regions.length; j++) {
                    const region1 = regions[i];
                    const region2 = regions[j];

                    // 计算并集
                    const union = [...region1.nodes];
                    region2.nodes.forEach(node2 => {
                        if (!union.some(node1 => node1.row === node2.row && node1.col === node2.col)) {
                            union.push(node2);
                        }
                    });

                    // 创建新的叠加区域
                    const newRegion = {
                        nodes: union,
                        counts: new Set([region1.count + region2.count]),
                        centers: [data.center]
                    };

                    this.log('\n发现新的并集区域：');
                    this.log(`  中心节点: (${data.center.row}, ${data.center.col})`);
                    this.log(`  区域1: ${region1.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${region1.count}`);
                    this.log(`  区域2: ${region2.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${region2.count}`);
                    this.log(`  并集区域: ${newRegion.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${Array.from(newRegion.counts)[0]}`);

                    // 添加到当前中心节点的区域集合中
                    data.regions.add(newRegion);

                    // 使用新的区域组合重新尝试推断
                    const noMineResult = this.analyzeNoMineRegions(centersList);
                    if (noMineResult) return noMineResult;

                    const hasMineResult = this.analyzeHasMineRegions(centersList);
                    if (hasMineResult) return hasMineResult;
                }
            }
        }

        return null;
    }

    analyzeIntersectionRegions(centersList, grid, rows, cols) {
        // 收集所有区域
        const allRegions = [];
        centersList.forEach(([_, data]) => {
            Array.from(data.regions).forEach(region => {
                allRegions.push(region);
            });
        });

        // 比较每对区域，寻找交集
        for (let i = 0; i < allRegions.length; i++) {
            for (let j = i + 1; j < allRegions.length; j++) {
                const region1 = allRegions[i];
                const region2 = allRegions[j];

                // 计算交集
                const intersection = region1.nodes.filter(node1 =>
                    region2.nodes.some(node2 =>
                        node2.row === node1.row && node2.col === node1.col
                    )
                );

                // 只处理交集格子数大于2的情况
                if (intersection.length >= 2) {
                    // 创建新的叠加区域
                    const newRegion = {
                        nodes: intersection,
                        counts: new Set([Math.min(region1.count, region2.count)]),
                        centers: []
                    };

                    // 找出这个新区域属于哪些中心节点
                    centersList.forEach(([_, data]) => {
                        const center = data.center;
                        const centerNeighbors = this.utils.getUnrevealedNeighbors(grid, rows, cols, center.row, center.col);
                        
                        // 检查新区域是否是这个中心节点的子集
                        const isSubset = newRegion.nodes.every(node =>
                            centerNeighbors.some(n =>
                                n.row === node.row && n.col === node.col
                            )
                        );

                        if (isSubset) {
                            const currentCount = center.value - this.utils.countFlagsAroundCells(grid, [{row: center.row, col: center.col}]);
                            newRegion.counts.add(currentCount);
                            newRegion.centers.push({ ...center, count: currentCount });
                        }
                    });

                    // 如果找到了相关的中心节点，尝试进行推断
                    if (newRegion.centers.length > 0) {
                        this.log('\n发现新的交集区域：');
                        this.log(`  格子: ${newRegion.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')}`);
                        this.log('  相关的中心节点:');
                        newRegion.centers.forEach(center => {
                            this.log(`    (${center.row}, ${center.col}) 值: ${center.value}, 需要的雷数: ${center.count}`);
                        });

                        // 添加到现有的中心节点分析中
                        centersList.forEach(([key, data]) => {
                            newRegion.centers.forEach(center => {
                                if (`${center.row},${center.col}` === key) {
                                    data.regions.add(newRegion);
                                }
                            });
                        });

                        // 使用新的区域组合重新尝试推断
                        const noMineResult = this.analyzeNoMineRegions(centersList);
                        if (noMineResult) return noMineResult;

                        const hasMineResult = this.analyzeHasMineRegions(centersList);
                        if (hasMineResult) return hasMineResult;
                    }
                }
            }
        }

        return null;
    }

    analyzeNoMineRegions(centersList) {
        for (const [centerKey, data] of centersList) {
            const regions = Array.from(data.regions);
            
            // 比较每对区域
            for (let i = 0; i < regions.length; i++) {
                for (let j = i + 1; j < regions.length; j++) {
                    const region1 = regions[i];
                    const region2 = regions[j];
                    
                    // 检查两个区域的包含关系（双向检查）
                    let smallerRegion, largerRegion, diffNodes;
                    
                    // 检查region2是否包含region1
                    const is2ContainsRegion1 = region1.nodes.every(node1 => 
                        region2.nodes.some(node2 => 
                            node2.row === node1.row && node2.col === node1.col
                        )
                    );
                    
                    // 检查region1是否包含region2
                    const is1ContainsRegion2 = region2.nodes.every(node2 => 
                        region1.nodes.some(node1 => 
                            node1.row === node1.row && node1.col === node1.col
                        )
                    );
                    
                    if (is2ContainsRegion1) {
                        smallerRegion = region1;
                        largerRegion = region2;
                        diffNodes = region2.nodes.filter(node2 => 
                            !region1.nodes.some(node1 => 
                                node1.row === node2.row && node1.col === node2.col
                            )
                        );
                    } else if (is1ContainsRegion2) {
                        smallerRegion = region2;
                        largerRegion = region1;
                        diffNodes = region1.nodes.filter(node1 => 
                            !region2.nodes.some(node2 => 
                                node2.row === node1.row && node2.col === node1.col
                            )
                        );
                    }
                    
                    if (smallerRegion && largerRegion && diffNodes.length > 0) {
                        // 获取两个区域的雷数
                        const smallCount = Array.from(smallerRegion.counts)[0];
                        const largeCount = Array.from(largerRegion.counts)[0];
                        
                        // 如果大区域的雷数等于小区域的雷数，差集区域一定没有雷
                        if (largeCount === smallCount) {
                            this.log(`\n发现无雷格子（雷数相等）：`);
                            this.log(`  小区域: ${smallerRegion.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${smallCount}`);
                            this.log(`  大区域: ${largerRegion.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${largeCount}`);
                            this.log(`  差集格子: ${diffNodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 一定不是雷`);
                            
                            return {
                                row: diffNodes[0].row,
                                col: diffNodes[0].col,
                                action: 'reveal',
                                isGuess: false
                            };
                        }

                        // 如果大区域的雷数小于小区域的雷数，差集区域也一定没有雷
                        if (largeCount < smallCount) {
                            this.log(`\n发现无雷格子（大区域雷数更少）：`);
                            this.log(`  小区域: ${smallerRegion.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${smallCount}`);
                            this.log(`  大区域: ${largerRegion.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${largeCount}`);
                            this.log(`  差集格子: ${diffNodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 一定不是雷`);
                            
                            return {
                                row: diffNodes[0].row,
                                col: diffNodes[0].col,
                                action: 'reveal',
                                isGuess: false
                            };
                        }
                    }
                }
            }
        }
        return null;
    }

    analyzeHasMineRegions(centersList) {
        for (const [centerKey, data] of centersList) {
            const regions = Array.from(data.regions);
            
            for (let i = 0; i < regions.length; i++) {
                for (let j = i + 1; j < regions.length; j++) {
                    const region1 = regions[i];
                    const region2 = regions[j];
                    
                    const isContained = region1.nodes.every(node1 => 
                        region2.nodes.some(node2 => 
                            node2.row === node1.row && node2.col === node1.col
                        )
                    );
                    
                    if (isContained) {
                        const diffNodes = region2.nodes.filter(node2 => 
                            !region1.nodes.some(node1 => 
                                node1.row === node2.row && node1.col === node2.col
                            )
                        );
                        
                        if (region2.count === region1.count + 1 && diffNodes.length === 1) {
                            this.log(`\n发现雷格子：`);
                            this.log(`  区域1: ${region1.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${region1.count}`);
                            this.log(`  区域2: ${region2.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${region2.count}`);
                            this.log(`  差集格子: ${diffNodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 一定是雷`);
                            
                            return {
                                row: diffNodes[0].row,
                                col: diffNodes[0].col,
                                action: 'flag',
                                isGuess: false
                            };
                        }
                    }
                }
            }
        }
        return null;
    }
}