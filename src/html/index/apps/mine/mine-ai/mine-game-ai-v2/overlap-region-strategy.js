import Utils from './utils.js';

function buildLevel(level1, level2) {
    if(level1 === level2) {
        return level1 + 1;
    }
    return Math.max(level1, level2) + 1;
}

function loadRegionSet(regionSet, region) {
    // 生成唯一区域标识字符串
    const regionKey = region.nodes
    .map(n => `${n.row},${n.col}`)
    .sort()
    .join('|');

    regionSet.add(regionKey);
}

function loadNodeToRegionMap(nodeToRegionMap, region) {
    const affectedNodeKeys = new Set();
    region.nodes.forEach(node => {
        // 使用坐标作为key
        const nodeKey = `${node.row},${node.col}`;
        if (!nodeToRegionMap.has(nodeKey)) {
            nodeToRegionMap.set(nodeKey, []);
        }
        var newRegion = {
            nodes: Array.from(region.nodes),
            level: region.level,
            counts: region.counts,
            actualMines: region.actualMines,
            minMines: region.minMines,
            maxMines: region.maxMines,
        };
        nodeToRegionMap.get(nodeKey).push(newRegion);
        affectedNodeKeys.add(nodeKey);
    });
    // 返回影响的 nodeKey
    return {
        affectedNodeKeys
    };
}

/**
 * 重叠区域策略类
 * 1. 计算重叠区域
 * 2. 计算中心节点
 * 3. 计算至少叠加区域
 * 4. 计算至少叠加中心节点
 * 5. 无雷推断
 * 6. 有雷推断
 */
export default class OverlapRegionStrategy {
    constructor(debug = false) {
        this.debug = debug;
        this.utils = new Utils();
        this.log = (...args) => {
            // if (this.debug) {
                console.log(...args);
            // }
        };
    }

    buildFlog(isLog) {
        return this.utils.buildFlog(isLog, this);
    }

    analyze(grid, rows, cols, revealedCells, debug) {
        var currentDebug = this.debug;
        if(debug === true) {
            this.debug = true;
        }
        var result = this.analyzeMain(grid, rows, cols, revealedCells);
        if(debug === true) {
            this.debug = currentDebug;
        }
        return result;
    }

    // 新增计算差集的方法
    calculateDiffNodes(largerRegion, smallerRegion) {
        return largerRegion.nodes.filter(largerNode => 
            !smallerRegion.nodes.some(smallerNode => 
                smallerNode.row === largerNode.row && smallerNode.col === largerNode.col
            )
        );
    }

    analyzeMain(grid, rows, cols, revealedCells) {
        const regions = new Map();
        // const centerNodeRegions = new Map();
        const nodeToRegionMap = new Map();
        const regionSet = new Set();
        // 至少叠加区域的映射
        const atLeastNodeToRegionMap = new Map();
        const atLeastRegionMap = new Map();
        // 至多叠加区域的映射
        const atMostNodeToRegionMap = new Map();

        // 遍历所有已揭示的数字格子
        for (const cell of revealedCells) {
            const { row, col } = cell;
            
            if (!grid[row][col].revealed || grid[row][col].isMine) continue;
            
            const value = grid[row][col].adjacentMines;
            if(value === 0) continue;

            // 获取这个中心节点周围所有的未揭示格子
            const unrevealedNeighbors = this.utils.getUnrevealedNeighbors(grid, rows, cols, row, col);
            if (unrevealedNeighbors.length === 0) continue;

            // 检查现有的区域，看是否是这个中心节点的子集，这个检查有必要吗？
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
                    level: 1,
                    actualMines: currentCount, // 实际雷数
                    counts: new Set([currentCount]),
                    centers: [{ row, col, value, count: currentCount }]
                });
            }
        }

        // 打印 regions 的数量
        let log16 = this.buildFlog(false);
        log16('\n=== 叠加区域统计 ===');
        log16(`总区域数量: ${regions.size}`);
        let totalNodes = 0;
        regions.forEach(region => {
            totalNodes += region.nodes.length;
        });
        log16(`总格子数量: ${totalNodes}`);
        log16(`平均每个区域格子数: ${(totalNodes / regions.size).toFixed(2)}`);

        regions.forEach((region, key) => {
            loadNodeToRegionMap(nodeToRegionMap, region);
            // 生成区域Set ，value表示唯一区域，value需要通过字符串表示
            loadRegionSet(regionSet, region);
        });

        // 遍历 regionSet 并打印
        var log9 = this.buildFlog(false);
        log9('\n=== 唯一区域统计 ===');
        log9(`总唯一区域数量: ${regionSet.size}`);
        let regionIndex = 1;
        regionSet.forEach(regionKey => {
            log9(`\n区域 ${regionIndex++}:` + regionKey);
        });
        

        var buildRegionByDiff = (nodeKeys) => { // 构建普通叠加区域
            var log10 = this.buildFlog(true);
            var calcSize = 0;
            var addNodeToRegionMap = new Map();
            const newAffectedKeys = new Set();
            nodeToRegionMap.forEach((regions, nodeKey) => {
                if(nodeKeys != null) {
                    if(!nodeKeys.has(nodeKey)) {
                        return;
                    } else {
                        // console.log('发起高级别构建');
                    }
                }
                // 比较每对区域
                for (let i = 0; i < regions.length; i++) {
                    for (let j = i + 1; j < regions.length; j++) {
                        const region1 = regions[i];
                        const region2 = regions[j];
                        calcSize ++;
                        
                        // 检查包含关系（双向检查）
                        let smallerRegion, largerRegion, diffNodes;
                        
                        // 检查包含关系
                        // 检查region2是否包含region1
                        let is2ContainsRegion1 = false;
                        is2ContainsRegion1 = this.utils.checkRegionContainOne(region1, region2);
                        
                        // 检查region1是否包含region2
                        let is1ContainsRegion2 = false;
                        is1ContainsRegion2 = this.utils.checkRegionContainOne(region2, region1);
                        
                        if (is2ContainsRegion1) {
                            smallerRegion = region1;
                            largerRegion = region2;
                            diffNodes = this.calculateDiffNodes(largerRegion, smallerRegion);
                        } else if (is1ContainsRegion2) {
                            smallerRegion = region2;
                            largerRegion = region1;
                            diffNodes = this.calculateDiffNodes(largerRegion, smallerRegion);
                        }
                        
                        // 如果存在包含关系，创建新的叠加区域
                        if (smallerRegion && largerRegion && diffNodes.length > 0) {
                            const smallCount = Array.from(smallerRegion.counts)[0];
                            const largeCount = Array.from(largerRegion.counts)[0];
                            const newMineCount = largeCount - smallCount;
                            if (diffNodes.length < 2) {
                                continue;
                            }
                            // 只有当差集的雷数大于0时才创建新区域
                            if (newMineCount > 0) {
                                // const newRegionKey = diffNodes.map(n => `${n.row},${n.col}`).sort().join('|');
                                const newRegion = {
                                    nodes: diffNodes,
                                    actualMines: newMineCount,
                                    counts: new Set([newMineCount]),
                                    centers: largerRegion.centers,
                                    level: buildLevel(largerRegion.level, smallerRegion.level),
                                    sourceRegion: {
                                        largerRegion,
                                        smallerRegion
                                    }
                                };

                                // 判断新增的区域是否已经存在于regionSet中
                                // regionSet
                                const newRegionKey = diffNodes.map(n => `${n.row},${n.col}`).sort().join('|');
                                if (regionSet.has(newRegionKey)) {
                                    // log10('\n发现重复区域，跳过添加:');
                                    // log10(`区域: ${diffNodes.map(n => `(${n.row}, ${n.col})`).join(', ')}`);
                                    continue;
                                }
                                // 将新区域添加到regionSet中
                                regionSet.add(newRegionKey);
                                // 更新节点到区域的映射
                                let { affectedNodeKeys } = loadNodeToRegionMap(addNodeToRegionMap, newRegion);
                                affectedNodeKeys.forEach(key => newAffectedKeys.add(key));

                                // if(newRegion.level > 4) {
                                //     log10('\n发现新的普通叠加区域:');
                                //     log10(`级别: ${largerRegion.level} 大区域: ${largerRegion.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${largeCount}`);
                                //     log10(`级别: ${smallerRegion.level} 小区域: ${smallerRegion.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${smallCount}`);
                                //     log10(`级别: ${newRegion.level} 新区域: ${diffNodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${newMineCount}`);
                                //     log10(`推断说明: 大区域减去小区域后，剩余格子中一定有${newMineCount}个雷`);
                                // }
                            }
                        }
                    }
                }
            });
            addNodeToRegionMap.forEach((regions, nodeKey) => {
                nodeToRegionMap.get(nodeKey).push(...regions);
            });
            // 返回影响的 affectedNodeKeys
            return newAffectedKeys;
        }

        // 递归构建叠加区域，最大递归深度为4
        const buildRegionByDiffRecursive = (nodeKeys = null, depth = 0) => {
            if (depth >= 10) return new Set(); // 最大递归深度限制
            
            const affectedKeys = buildRegionByDiff(nodeKeys);
            if (affectedKeys.size === 0) return affectedKeys;
            
            // 递归处理受影响的节点
            const nextAffectedKeys = buildRegionByDiffRecursive(affectedKeys, depth + 1);
            return nextAffectedKeys;
        };

        buildRegionByDiffRecursive();

        // 遍历 nodeToRegionMap 并打印
        var log3 = this.buildFlog(false);
        log3('\n=== 节点与叠加区域的关系 ===');
        nodeToRegionMap.forEach((regions, nodeKey) => {
            const [row, col] = nodeKey.split(',').map(Number);
            log3(`\n节点 (${row}, ${col}) 关联的叠加区域:`);
            regions.forEach((region, index) => {
                log3(`- 区域 ${index + 1}:`);
                log3(`- 格子: ${region.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')}`);
                log3(`- 雷数: ${Array.from(region.counts)[0]}`);
                log3(`- 级别: ${region.level}`);
                // log3(`- 中心节点: ${region.centers.map(c => `(${c.row}, ${c.col})[值=${c.value}]`).join(', ')}`);
            });
        });

        var log11 = this.buildFlog(false);
        
        // 尝试无雷推断
        const noMineResult = this.analyzeNoMineRegions(nodeToRegionMap);
        if (noMineResult) {
            // console.log('无雷推断1');
            return this.utils.verifyResult(noMineResult, grid, '无雷');
        } else {
            log11('\n无雷推断结束：未找到可以确定的无雷格子');
        }

        // 尝试有雷推断
        const hasMineResult = this.analyzeHasMineRegions(nodeToRegionMap);
        if (hasMineResult) {
            console.log('有雷推断1');
            return this.utils.verifyResult(hasMineResult, grid, '有雷');
        }
        
        // 纯注释代码
        {
        // 可以根据叠加区域找到所有的中心节点了
        // 现在还需要根据中心节点找到所有的叠加区域
        // let centerList = [];
        // regions.forEach((region, key) => {
        //     region.centers.forEach(center => {
        //         if (!centerNodeRegions.has(center)) {
        //             centerNodeRegions.set(center, []);
        //         }
        //         centerNodeRegions.get(center).push(region);
        //         // 获取所有中心节点
        //         centerList.push(center);
        //     });
        // });

        // 对中心节点去重
        // const uniqueCenters = new Map();
        // centerList.forEach(center => {
        //     const key = `${center.row},${center.col}`;
        //     if (!uniqueCenters.has(key)) {
        //         uniqueCenters.set(key, {
        //             center: center,
        //             regions: new Set()
        //         });
        //     }
        //     centerNodeRegions.get(center).forEach(region => {
        //         uniqueCenters.get(key).regions.add(region);
        //     });
        // });

        // 想办法去掉 uniqueCenters 参数
        // 想办法去掉 centerNodeRegions 参数

        // 打印所有中心节点及其叠加区域
        // this.log('\n=== 中心节点分析 ===');
        // uniqueCenters.forEach((data, key) => {
        //     this.log(`\n中心节点 (${data.center.row}, ${data.center.col}) 值: ${data.center.value}`);
        //     this.log('关联的叠加区域:');
        //     Array.from(data.regions).forEach((region, index) => {
        //         this.log(`  区域 ${index + 1}:`);
        //         this.log(`    格子: ${region.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')}`);
        //         this.log(`    需要的雷数: ${data.center.count}`);
        //     });
        // });

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
        }

        // 在处理完普通叠加区域后，生成至少叠加区域
        var log2 = this.buildFlog(false);
        
        log2('\n=== 至少叠加区域分析 ===');
        regions.forEach((region, key) => {
            const nodes = region.nodes;
            const mineCount = Array.from(region.counts)[0];
            
            // 只处理有2个以上格子且雷数大于1的区域
            if (nodes.length >= 2 && mineCount > 0) {
                
                // 计算可能的组合大小范围
                const minGroupSize = 2;  // 最小组合大小
                const maxGroupSize = nodes.length - 1;  // 最大组合大小
                let logAll = '';
                // 遍历不同的组合大小
                for (let groupSize = minGroupSize; groupSize <= maxGroupSize; groupSize++) {
                    // 计算当前组合大小下的最小雷数
                    const splitOutCount = nodes.length - groupSize;
                    const minMines = mineCount - splitOutCount;

                    // 如果最小雷数小于等于0，跳过
                    if (minMines <= 0) continue;

                    // 生成所有可能的组合
                    this.utils.generateCombinations(nodes, groupSize).forEach(combination => {
                        const regionKey = combination
                            .map(n => `${n.row},${n.col}`)
                            .sort()
                            .join('|');

                        // 检查是否已存在更好的组合
                        if (atLeastRegionMap.has(regionKey)) {
                            const existingRegion = atLeastRegionMap.get(regionKey);
                            if (existingRegion.minMines >= minMines) {
                                return;
                            }
                        }

                        const atLeastRegion = {
                            nodes: combination,
                            minMines,
                            centers: region.centers,
                            isAtLeast: true,
                            sourceRegion: {
                                nodes: nodes,
                                mineCount: mineCount,
                                splitOutCount: splitOutCount
                            }
                        };

                        loadNodeToRegionMap(atLeastNodeToRegionMap, atLeastRegion);
                        atLeastRegionMap.set(regionKey, atLeastRegion);

                        var logData = '';
                        logData += `- 格子组合: ${combination.map(n => `(${n.row}, ${n.col})`).join(', ')}\n` ;
                        logData += `  至少雷数: ${atLeastRegion.minMines}\n` ;
                        // logData += `  拆分来源: ${atLeastRegion.sourceRegion.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${atLeastRegion.sourceRegion.mineCount}\n` ;
                        logData += `  拆分说明: 原始区域${nodes.length}个格子${mineCount}个雷，拆分出${splitOutCount}个格子，剩余至少${minMines}个雷\n` ;

                        logAll += (logData + '\n');
                    });
                }

                if(logAll == '') {
                    return;
                }

                log2(`\n原始区域信息:`);
                log2(`- 格子: ${nodes.map(n => `(${n.row}, ${n.col})`).join(', ')}`);
                log2(`- 雷数: ${mineCount}`);
                log2(`- 中心节点: ${region.centers.map(c => `(${c.row}, ${c.col})[值=${c.value}]`).join(', ')}`);
                log2('- 生成的至少区域:');
                log2(logAll);
            }
        });

        var log4 = this.buildFlog(false);
        log4('\n=== 节点与至少叠加区域的关系 ===');
        atLeastNodeToRegionMap.forEach((regions, nodeKey) => {
            const [row, col] = nodeKey.split(',').map(Number);
            log4(`\n节点 (${row}, ${col}) 关联的至少叠加区域:`);
            regions.forEach((region, index) => {
                log4(`- 区域 ${index + 1}:`);
                log4(`- 格子: ${region.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')}`);
                log4(`- 至少雷数: ${region.minMines}`);
                // log3(`- 中心节点: ${region.centers.map(c => `(${c.row}, ${c.col})[值=${c.value}]`).join(', ')}`);
            });
        });

        // 至少区域无雷推断
        const noMineResult2 = this.analyzeNoMineAtLeastRegions2(
            nodeToRegionMap, 
            atLeastNodeToRegionMap
        )
        if (noMineResult2) {
            // console.log('\n第一次至少区域无雷推断结束：找到可以确定的无雷格子');
            return this.utils.verifyResult(noMineResult2, grid, '无雷');
        } else {
            log11('\第一次n至少区域无雷推断结束：未找到可以确定的无雷格子');
        }


        // 至多叠加区域分析
        var log5 = this.buildFlog(false);
        const atMostRegions = new Map();
        regions.forEach((region, key) => {
            const nodes = region.nodes;
            const mineCount = Array.from(region.counts)[0];
            
            // 只处理有3个以上格子的区域
            if (nodes.length > mineCount + 1) {
                
                var logAll = '';
                // 生成所有可能的mineCount+1个格子的组合
                for (let i = 0; i < nodes.length - mineCount; i++) {
                    const combination = nodes.slice(i, i + mineCount + 1);
                    if (combination.length === mineCount + 1) {
                        const regionKey = combination.map(n => `${n.row},${n.col}`).sort().join('|');
                        
                        const atMostRegion = {
                            nodes: combination,
                            maxMines: mineCount,
                            centers: region.centers,
                            isAtMost: true,
                            sourceRegion: {
                                nodes: nodes,
                                mineCount: mineCount
                            }
                        };

                        loadNodeToRegionMap(atMostNodeToRegionMap, atMostRegion);
                        
                        atMostRegions.set(regionKey, atMostRegion);
                        
                        var logData = '';
                        logData += `\n生成的至多区域:\n`;
                        logData += `- 格子组合: ${combination.map(n => `(${n.row}, ${n.col})`).join(', ')}\n`;
                        logData += `- 至多雷数: ${atMostRegion.maxMines}\n`;
                        logData += `- 推断说明: ${mineCount + 1}个格子中至多有${mineCount}个雷，所以至少有一个不是雷\n`;

                        logAll += (logData + '\n');
                    }
                }

                log5(`\n原始区域信息:`);
                log5(`- 格子: ${nodes.map(n => `(${n.row}, ${n.col})`).join(', ')}`);
                log5(`- 雷数: ${mineCount}`);
                log5(`- 生成的至多区域:`);
                log5(logAll);
            }
        });

        var log6 = this.buildFlog(false);
        log6('\n=== 节点与至多叠加区域的关系 ===');
        atMostNodeToRegionMap.forEach((regions, nodeKey) => {
            const [row, col] = nodeKey.split(',').map(Number);
            log6(`\n节点 (${row}, ${col}) 关联的至多叠加区域:`);
            regions.forEach((region, index) => {
                log6(`- 区域 ${index + 1}:`);
                log6(`- 格子: ${region.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')}`);
                log6(`- 至多雷数: ${region.maxMines}`);
                // log3(`- 中心节点: ${region.centers.map(c => `(${c.row}, ${c.col})[值=${c.value}]`).join(', ')}`);
            });
        });

        // 通过至多叠加区域生成新的至少叠加区域
        // 至多叠加区域只能是子集，普通叠加区域减去至多叠加区域，剩余的就是至少叠加区域
        var log7 = this.buildFlog(false);
        log7('\n=== 通过至多叠加区域生成新的至少叠加区域 ===');
        const newRegions = new Map();
        
        regions.forEach((region, regionKey) => {
            atMostRegions.forEach((atMostRegion, atMostKey) => {
                // 检查普通区域是否包含至多区域
                const isContained = atMostRegion.nodes.every(node1 => 
                    region.nodes.some(node2 => 
                        node2.row === node1.row && node2.col === node1.col
                    )
                );

                if (isContained) {
                    // 计算差集（普通区域减去至多区域）
                    const diffNodes = this.calculateDiffNodes(region, atMostRegion);
                    
                    if (diffNodes.length > 0) {
                        const mineCount = Array.from(region.counts)[0] - atMostRegion.maxMines;
                        
                        // 只有当差集的雷数大于0时才创建新区域
                        if (mineCount > 0) {
                            const newRegionKey = diffNodes.map(n => `${n.row},${n.col}`).sort().join('|');
                            
                            const newRegion = {
                                nodes: diffNodes,
                                minMines: mineCount,
                                counts: new Set([mineCount]),
                                centers: region.centers,
                                sourceRegion: {
                                    region: region,
                                    atMostRegion: atMostRegion
                                }
                            };
                            
                            newRegions.set(newRegionKey, newRegion);
                            
                            log7('\n发现新的至少叠加区域:');
                            log7(`原始区域: ${region.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${Array.from(region.counts)[0]}`);
                            log7(`至多区域: ${atMostRegion.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 至多雷数: ${atMostRegion.maxMines}`);
                            log7(`新至少区域: ${diffNodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 至少雷数: ${mineCount}`);
                            log7(`推断说明: 原始区域减去至多区域后，剩余格子中一定至少有${mineCount}个雷`);
                        }
                    }
                }
            });
        });

        // 将新生成的区域添加到至少叠加区域集合中
        var size = 0;
        newRegions.forEach((region, key) => {
            regions.set(key, region);
            size ++;
            loadNodeToRegionMap(atLeastNodeToRegionMap, region);
        });

        if(size > 0) {
            var log8 = this.buildFlog(false);
            log8('\n=== 节点与至少叠加区域的关系 ===');
            atLeastNodeToRegionMap.forEach((regions, nodeKey) => {
                const [row, col] = nodeKey.split(',').map(Number);
                log8(`\n节点 (${row}, ${col}) 关联的至少叠加区域:`);
                regions.forEach((region, index) => {
                    log8(`- 区域 ${index + 1}:`);
                    log8(`- 格子: ${region.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')}`);
                    log8(`- 至少雷数: ${region.minMines}`);
                    // log3(`- 中心节点: ${region.centers.map(c => `(${c.row}, ${c.col})[值=${c.value}]`).join(', ')}`);
                });
            });
            // 至少区域无雷推断
            const noMineResult2 = this.analyzeNoMineAtLeastRegions2(
                nodeToRegionMap, 
                atLeastNodeToRegionMap
            )
            if (noMineResult2) {
                console.log('\n第二次至少区域无雷推断2结束：找到可以确定的无雷格子');
                return this.utils.verifyResult(noMineResult2, grid, '无雷');
            } else {
                // console.log('\n至少区域无雷推断2结束：未找到可以确定的无雷格子');
            }
        }

        // 尝试至多区域推断，举个例子：
        // 假设普通区域有4个格子，3个雷
        // 至多区域有两个格子，至多区域有一个雷
        // 普通区域包含至多区域，至多区域只能作为子集使用
        // 那么普通区域减去至多区域后，剩余的格子一定有2个雷
        const atMostResult = this.analyzeAtMostRegions(nodeToRegionMap, 
            atMostNodeToRegionMap);
        if (atMostResult) {
            // console.log('\n至多区域推断结束：找到可以确定的有雷格子');
            return this.utils.verifyResult(atMostResult, grid, '至多区域');
        } else {
            // console.log('\n至多区域推断结束：未找到可以确定的无雷格子');
        }

        // 单独叠加区域拆分成至少叠加区域
        // 举个例子 格子: (0, 3), (1, 3), (2, 3) 中有N个雷
        // 那么可以拆分为 (0, 3), (1, 3) 至少有一个雷，记为 >N-1 数量的雷
        // (1, 3), (2, 3) 至少有一个雷，记为 >N-1 数量的雷
        // (0, 3), (2, 3) 至少有一个雷，记为 >N-1 数量的雷
        // >N-1 数量的雷 在做无雷推断时，只能当作小区域
        // 当大区域包含该小区域时，大区域的雷数为N-1时，则大区域与小区域的差距就是没有雷的
        // 至少N个雷的单独叠加区域，用一个单独的变量记下来，因为这是至少N个雷的叠加区域，只能用作小区域
        // 至少叠加区域同样做一个中心节点到叠加区域的映射

        // 叠加区域可以组合在一起获得新的叠加区域
        // 通过取交集获得新的叠加区域，当新的叠加区域格子数大于2时有效
        // 再判断新的叠加区域属于哪个中心节点
        // 然后再重复之前的逻辑去做有雷和无雷推断
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
                            newRegion.centers.push(Object.assign({}, center, { count: currentCount }));
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

    analyzeNoMineRegions(nodeToRegionMap) {
        var log13 = this.buildFlog(false);
        for (const [nodeKey, data] of nodeToRegionMap) {
            log13(`\n分析节点 ${nodeKey} 的所有区域`);
            const regions = Array.from(data);
            
            // 比较每对区域
            for (let i = 0; i < regions.length; i++) {
                for (let j = i + 1; j < regions.length; j++) {
                    const region1 = regions[i];
                    const region2 = regions[j];
                    
                    log13(`\n比较两个区域:`);
                    log13(`区域1: ${region1.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${Array.from(region1.counts)[0]}`);
                    log13(`区域2: ${region2.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${Array.from(region2.counts)[0]}`);
                    
                    const { is2ContainsRegion1, is1ContainsRegion2 } = this.utils.checkRegionContainment(region1, region2);

                    // 检查两个区域的包含关系（双向检查）
                    let smallerRegion, largerRegion, diffNodes;
                    
                    if (is2ContainsRegion1) {
                        log13('发现包含关系: 区域2 包含 区域1');
                        smallerRegion = region1;
                        largerRegion = region2;
                        diffNodes = this.calculateDiffNodes(largerRegion, smallerRegion);
                    } else if (is1ContainsRegion2) {
                        log13('发现包含关系: 区域1 包含 区域2');
                        smallerRegion = region2;
                        largerRegion = region1;
                        diffNodes = this.calculateDiffNodes(largerRegion, smallerRegion);
                    } else {
                        log13('未发现包含关系，继续检查下一对区域');
                        continue;
                    }
                    
                    if (smallerRegion && largerRegion && diffNodes.length > 0) {
                        // 获取两个区域的雷数
                        const smallCount = Array.from(smallerRegion.counts)[0];
                        const largeCount = Array.from(largerRegion.counts)[0];
                        
                        log13(`\n分析雷数关系:`);
                        log13(`小区域雷数: ${smallCount}`);
                        log13(`大区域雷数: ${largeCount}`);
                        log13(`差集格子数量: ${diffNodes.length}`);
                        
                        // 如果大区域的雷数等于小区域的雷数，差集区域一定没有雷
                        if (largeCount === smallCount) {
                            log13(`\n推断原因: 大区域雷数(${largeCount}) = 小区域雷数(${smallCount})`);
                            log13(`结论: 差集格子 ${diffNodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 一定不是雷`);
                            log13(`原因: 因为大区域包含小区域，且雷数相等，所以额外的格子一定不是雷`);
                            
                            return {
                                row: diffNodes[0].row,
                                col: diffNodes[0].col,
                                action: 'reveal',
                                isGuess: false
                            };
                        }

                        // 如果大区域的雷数小于小区域的雷数，差集区域也一定没有雷
                        if (largeCount < smallCount) {
                            log13(`\n推断原因: 大区域雷数(${largeCount}) < 小区域雷数(${smallCount})`);
                            log13(`结论: 差集格子 ${diffNodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 一定不是雷`);
                            log13(`原因: 因为大区域包含小区域，但雷数反而更少，所以额外的格子一定不是雷`);
                            
                            return {
                                row: diffNodes[0].row,
                                col: diffNodes[0].col,
                                action: 'reveal',
                                isGuess: false
                            };
                        }
                        
                        log13('未找到可以推断的情况，继续检查下一对区域');
                    }
                }
            }
        }
        return null;
    }

    analyzeNoMineAtLeastRegions2(nodeToRegionMap, atLeastNodeToRegionMap) {
        var log14 = this.buildFlog(false);
        for (const [nodeKey, data] of nodeToRegionMap) {
            log14(`\n分析节点 ${nodeKey} 的所有至少叠加区域`);
            const regions = Array.from(data);
            const atLeastRegions = atLeastNodeToRegionMap.get(nodeKey);
            
            if (!atLeastRegions) continue;

            // 遍历所有普通区域和至少区域的组合
            for (const region of regions) {
                for (const atLeastRegion of atLeastRegions) {
                    // 检查普通区域是否包含至少区域
                    const isContained = atLeastRegion.nodes.every(node1 => 
                        region.nodes.some(node2 => 
                            node2.row === node1.row && node2.col === node1.col
                        )
                    );

                    if (isContained) {
                        const diffNodes = this.calculateDiffNodes(region, atLeastRegion);
                        const regionCount = Array.from(region.counts)[0];

                        // 如果普通区域的雷数等于至少区域的最小雷数，差集一定都是雷
                        if (regionCount === atLeastRegion.minMines && diffNodes.length > 0) {
                            log14(`\n发现有雷推断:`);
                            log14(`普通区域: ${region.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${regionCount}`);
                            log14(`至少区域: ${atLeastRegion.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 最小雷数: ${atLeastRegion.minMines}`);
                            log14(`差集格子: ${diffNodes.map(n => `(${n.row}, ${n.col})`).join(', ')}`);
                            
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

    analyzeHasMineRegions(nodeToRegionMap) {
        var log15 = this.buildFlog(false);
        for (const [nodeKey, data] of nodeToRegionMap) {
            log15(`\n分析节点 ${nodeKey} 的所有区域`);
            const regions = Array.from(data);
            
            // 比较每对区域
            for (let i = 0; i < regions.length; i++) {
                for (let j = i + 1; j < regions.length; j++) {
                    const region1 = regions[i];
                    const region2 = regions[j];
                    
                    // 检查包含关系
                    let smallerRegion, largerRegion, diffNodes;
                    
                    // 检查包含关系（双向）
                    const { is2ContainsRegion1, is1ContainsRegion2 } = this.utils.checkRegionContainment(region1, region2);
                    
                    if (is2ContainsRegion1) {
                        smallerRegion = region1;
                        largerRegion = region2;
                        diffNodes = this.calculateDiffNodes(region2, region1);
                    } else if (is1ContainsRegion2) {
                        smallerRegion = region2;
                        largerRegion = region1;
                        diffNodes = this.calculateDiffNodes(region1, region2);
                    } else {
                        continue;
                    }
                    
                    if (smallerRegion && largerRegion && diffNodes.length > 0) {
                        const smallCount = Array.from(smallerRegion.counts)[0];
                        const largeCount = Array.from(largerRegion.counts)[0];
                        
                        // 如果大区域的雷数等于小区域雷数加上差集格子数，差集区域都是雷
                        if (largeCount === smallCount + diffNodes.length) {
                            log15(`\n发现有雷推断:`);
                            log15(`小区域: ${smallerRegion.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${smallCount}`);
                            log15(`大区域: ${largerRegion.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${largeCount}`);
                            log15(`差集格子: ${diffNodes.map(n => `(${n.row}, ${n.col})`).join(', ')}`);
                            log15(`推断原因: 大区域雷数(${largeCount}) = 小区域雷数(${smallCount}) + 差集格子数(${diffNodes.length})`);
                            log15(`结论: 差集格子一定都是雷`);
                            
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
        
        log15('\n有雷推断结束：未找到可以确定的雷格子');
        return null;
    }

    analyzeAtMostRegions(nodeToRegionMap, atMostNodeToRegionMap) {
        var log12 = this.buildFlog(false);
        
        // 遍历所有普通区域和至多区域的组合
        for (const [nodeKey, regions] of nodeToRegionMap) {
            const atMostRegions = atMostNodeToRegionMap.get(nodeKey);
            if (!atMostRegions) continue;

            for (const region of regions) {
                for (const atMostRegion of atMostRegions) {
                    // 检查普通区域是否包含至多区域
                    const isContained = atMostRegion.nodes.every(node1 => 
                        region.nodes.some(node2 => 
                            node2.row === node1.row && node2.col === node1.col
                        )
                    );

                    if (isContained) {
                        // 计算差集（普通区域减去至多区域）
                        const diffNodes = this.calculateDiffNodes(region, atMostRegion);
                        const regionCount = Array.from(region.counts)[0];
                        
                        // 情况1：如果普通区域的雷数减去至多区域的最大雷数等于差集格子数，差集格子都是雷
                        const remainingMines = regionCount - atMostRegion.maxMines;
                        if (remainingMines === diffNodes.length && diffNodes.length > 0) {
                            log12(`\n发现有雷推断:`);
                            log12(`普通区域: ${region.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${regionCount}`);
                            log12(`至多区域: ${atMostRegion.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 最大雷数: ${atMostRegion.maxMines}`);
                            log12(`差集格子: ${diffNodes.map(n => `(${n.row}, ${n.col})`).join(', ')}`);
                            log12(`推断说明: 普通区域${regionCount}个雷减去至多区域最多${atMostRegion.maxMines}个雷，剩余的${diffNodes.length}个格子必须都是雷`);
                            
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
        
        log12('\n至多区域推断结束：未找到可以确定的格子');
        return null;
    }
}