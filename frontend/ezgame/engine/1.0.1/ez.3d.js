var ez;
(function (ez) {
    const JOINT_NULL = 0xff;
    let SemanticIndex;
    (function (SemanticIndex) {
        SemanticIndex[SemanticIndex["POSITION"] = 0] = "POSITION";
        SemanticIndex[SemanticIndex["NORMAL"] = 1] = "NORMAL";
        SemanticIndex[SemanticIndex["JOINTS"] = 2] = "JOINTS";
        SemanticIndex[SemanticIndex["WEIGHTS"] = 3] = "WEIGHTS";
        SemanticIndex[SemanticIndex["TANGENT"] = 4] = "TANGENT";
        SemanticIndex[SemanticIndex["TEXCOORD0"] = 5] = "TEXCOORD0";
        SemanticIndex[SemanticIndex["TEXCOORD1"] = 6] = "TEXCOORD1";
    })(SemanticIndex = ez.SemanticIndex || (ez.SemanticIndex = {}));
    function type2Size(type, gl) {
        switch (type) {
            case 5126: return 4;
            case 5120:
            case 5121: return 1;
            case 5122:
            case 5123: return 2;
        }
        return 0;
    }
    class TriangleSet {
        constructor() {
            this.joints = new Set();
            this.indices = new Set();
            this.triangles = [];
        }
        contain(i1, i2, i3) {
            let indices = this.indices;
            return indices.has(i1) || indices.has(i2) || indices.has(i3);
        }
        add(idx, joints, count) {
            this.triangles.push(idx);
            this.indices.add(idx);
            for (let j = 0; j < count; j++) {
                var t = joints[idx * count + j];
                if (t != JOINT_NULL)
                    this.joints.add(t);
            }
        }
        combine(s) {
            var joints = this.joints;
            var indices = this.indices;
            s.joints.forEach(j => joints.add(j));
            s.indices.forEach(j => indices.add(j));
            this.triangles = this.triangles.concat(s.triangles);
        }
    }
    function find(arr, pred) {
        for (var i = 0; i < arr.length; i++)
            if (pred(arr[i]))
                return arr[i];
        return null;
    }
    class Primitive {
        updateData() {
            var channels = this.channels;
            var vertCount = this.vertCount;
            var offset = this.stride;
            var vertices = new Float32Array(offset * vertCount);
            for (var i = 0; i < channels.length; i++) {
                var c = channels[i];
                if (c.type == 5126) {
                    var s = offset >> 2;
                    let buf = new Float32Array(vertices.buffer, c.offset);
                    var idx = 0;
                    for (var j = 0; j < vertCount; j++) {
                        for (var k = 0; k < c.count; k++)
                            buf[j * s + k] = c.data[idx++];
                    }
                }
                else if (c.type == 5122 || c.type == 5123) {
                    var s = offset >> 1;
                    let buf = new Int16Array(vertices.buffer, c.offset);
                    var idx = 0;
                    for (var j = 0; j < vertCount; j++) {
                        for (var k = 0; k < c.count; k++)
                            buf[j * s + k] = c.data[idx++];
                    }
                }
                else if (c.type == 5120 || c.type == 5121) {
                    var s = offset;
                    let buf = new Int8Array(vertices.buffer, c.offset);
                    var idx = 0;
                    for (var j = 0; j < vertCount; j++) {
                        for (var k = 0; k < c.count; k++)
                            buf[j * s + k] = c.data[idx++];
                    }
                }
                else {
                    Log.error("unknown type:", c.type);
                }
            }
            var gl = ez.getGL();
            gl.bindBuffer(34962, this.vbo);
            gl.bufferData(34962, vertices, 35044);
            gl.bindBuffer(34963, this.ibo);
            gl.bufferData(34963, this.indices, 35044);
        }
        load(channels, vertCount, indices) {
            var gl = ez.getGL();
            var offset = 0;
            var i;
            var c;
            for (i = 0; i < channels.length; i++) {
                c = channels[i];
                c.index = SemanticIndex[c.semantic];
                if (c.semantic == "TANGENT")
                    this.hasTangent = true;
            }
            channels.sort((a, b) => a.index > b.index ? 1 : a.index == b.index ? 0 : -1);
            for (i = 0; i < channels.length; i++) {
                c = channels[i];
                var size = type2Size(c.type, gl);
                c.offset = offset;
                offset += (size * c.count + 3) & ~3;
            }
            this.channels = channels;
            this.vertCount = vertCount;
            this.idxCount = indices.length;
            this.stride = offset;
            this.indices = indices;
            var vbo = this.vbo = gl.createBuffer();
            var ibo = this.ibo = gl.createBuffer();
            this.updateData();
            var rc = ez.RenderContext;
            this.vaoBind = rc.createVAO(function (gl) {
                gl.bindBuffer(34963, ibo);
                gl.bindBuffer(34962, vbo);
                for (var i = 0; i < channels.length; i++) {
                    var c = channels[i];
                    gl.enableVertexAttribArray(c.index);
                    gl.vertexAttribPointer(c.index, c.count, c.type, c.normalized, offset, c.offset);
                }
            });
        }
        splitSkin(limit) {
            if (this.skins)
                return;
            var triangles = [];
            var dict = [];
            var t = Date.now();
            let indices = this.indices;
            var jointChannel = find(this.channels, function (a) {
                return a.semantic == "JOINTS";
            });
            var weightChannel = find(this.channels, function (a) {
                return a.semantic == "WEIGHTS";
            });
            var joints = new Set();
            var jointsData = jointChannel.data;
            var weights = weightChannel.data;
            for (var i = 0; i < jointsData.length; i++) {
                if (weights[i] > 0)
                    joints.add(jointsData[i]);
                else
                    jointsData[i] = JOINT_NULL;
            }
            for (let i = 0; i < indices.length; i += 3) {
                var set;
                for (let j = 0; j < 3; j++) {
                    set = dict[indices[i + j]];
                    if (set)
                        break;
                }
                if (!set) {
                    set = new TriangleSet();
                    triangles.push(set);
                }
                for (let j = 0; j < 3; j++)
                    set.add(indices[i + j], jointsData, 4);
                for (let j = 0; j < 3; j++) {
                    let idx = indices[i + j];
                    let s = dict[idx];
                    if (s && s != set) {
                        let index = triangles.indexOf(s);
                        if (index >= 0) {
                            set.combine(s);
                            s.indices.forEach(idx => dict[idx] = set);
                            triangles.splice(index, 1);
                        }
                    }
                    dict[idx] = set;
                }
            }
            var groupIdx = [0];
            var groupJoints = [];
            function toList(set) {
                var arr = [];
                set.forEach(t => arr.push(t));
                return arr;
            }
            function getJoints() {
                var idx = groupIdx[groupIdx.length - 1];
                var listJoint = [];
                joints.forEach(function (t) {
                    var j = { key: t, joints: new Set() };
                    listJoint.push(j);
                    for (let i = idx; i < triangles.length; i++) {
                        var tri = triangles[i];
                        if (tri.joints.has(t)) {
                            tri.joints.forEach(t => j.joints.add(t));
                        }
                    }
                });
                listJoint.sort((t1, t2) => {
                    var s1 = t1.joints.size;
                    var s2 = t2.joints.size;
                    return s1 > s2 ? 1 : s1 == s2 ? 0 : -1;
                });
                return listJoint;
            }
            function split() {
                if (joints.size < limit) {
                    groupJoints.push(toList(joints));
                    groupIdx.push(triangles.length);
                    return false;
                }
                var jointsTbl = getJoints();
                var selected = [];
                var group = new Set();
                jointsTbl[0].joints.forEach(t => group.add(t));
                selected.push(jointsTbl[0].key);
                let i = 1;
                while (i < jointsTbl.length) {
                    var tbl = jointsTbl[i++];
                    if (group.size + tbl.joints.size <= limit) {
                        tbl.joints.forEach(t => group.add(t));
                    }
                    else {
                        let cnt = group.size;
                        tbl.joints.forEach(t => { if (!group.has(t))
                            cnt++; });
                        if (cnt > limit)
                            continue;
                        tbl.joints.forEach(t => group.add(t));
                    }
                    selected.push(tbl.key);
                }
                for (i = 0; i < selected.length; i++)
                    joints.delete(selected[i]);
                let idx = groupIdx[groupIdx.length - 1];
                for (i = idx; i < triangles.length; i++) {
                    let tri = triangles[i];
                    for (let j = 0; j < selected.length; j++) {
                        if (tri.joints.has(selected[j])) {
                            triangles[i] = triangles[idx];
                            triangles[idx++] = tri;
                            break;
                        }
                    }
                }
                for (i = groupIdx[groupIdx.length - 1]; i < idx; i++) {
                    let tri = triangles[i];
                    tri.joints.forEach(t => {
                        if (!group.has(t))
                            console.log("not find:", tri.joints, group, t);
                    });
                }
                groupJoints.push(toList(group));
                groupIdx.push(idx);
                return true;
            }
            while (split())
                ;
            this.skins = [];
            this.groups = [0];
            var skin = this.skin;
            var invMatBuf = ezasm.handleToFloatArray(skin.hInvMatrix, skin.joints.length * 12);
            var newIndices = this.indices;
            var idx = 0;
            var j = 1;
            for (i = 0; i < triangles.length; i++) {
                if (groupIdx[j] == i) {
                    this.groups.push(idx);
                    j++;
                }
                let tri = triangles[i];
                let joints = groupJoints[j - 1];
                tri.indices.forEach(idx => {
                    for (let k = 0; k < 4; k++) {
                        let t = idx * 4 + k;
                        if (jointsData[t] == JOINT_NULL)
                            jointsData[t] = 0;
                        else {
                            var a = joints.indexOf(jointsData[t]);
                            if (a < 0) {
                                console.log("not find", jointsData[t], i, t, tri);
                            }
                            else
                                jointsData[t] = a;
                        }
                    }
                });
                newIndices.set(tri.triangles, idx);
                idx += tri.triangles.length;
            }
            this.groups.push(idx);
            for (i = 0; i < groupJoints.length; i++) {
                var newJoints = groupJoints[i];
                var invMatHandler = ezasm.malloc(newJoints.length * 12 * 4);
                var newMatBuf = ezasm.handleToFloatArray(invMatHandler, newJoints.length * 12);
                for (j = 0; j < newJoints.length; j++) {
                    let m = invMatBuf.slice(newJoints[j] * 12, (newJoints[j] + 1) * 12);
                    newMatBuf.set(m, j * 12);
                }
                this.skins[i] = new ez.Skin({
                    joints: newJoints.map(t => skin.joints[t]),
                    jointNames: newJoints.map(t => skin.jointNames[t]),
                    inverseMatrixhandle: invMatHandler
                });
            }
            this.updateData();
            this.skin = null;
            console.log("split skin: %i ms, triangles:%i, triangle set:%i", Date.now() - t, indices.length / 3, triangles.length, groupIdx, groupJoints);
        }
        remapSkin(skeleton) {
            if (!this.skin && !this.skins) {
                Log.error("no skin data.");
                return null;
            }
            var nodeNames = {};
            for (var i = 0; i < skeleton.length; i++)
                nodeNames[skeleton[i].name] = i;
            function remap(skin) {
                var joints = skin.jointNames.map(n => {
                    var idx = nodeNames[n];
                    if (idx === undefined) {
                        Log.error(`the skin has not find node: ${n}`);
                        idx = 0;
                    }
                    return idx;
                });
                var s = new ez.Skin();
                for (var k in skin)
                    s[k] = skin[k];
                s.joints = joints;
                return s;
            }
            var p = new Primitive();
            for (var k in this)
                p[k] = this[k];
            if (this.skin)
                p.skin = remap(this.skin);
            else
                p.skins = this.skins.map(s => remap(s));
            return p;
        }
        draw(ctx, skeleton) {
            var gl = ctx.gl;
            if (ctx.lastPrimitive !== this) {
                this.vaoBind();
                ctx.lastPrimitive = this;
            }
            if (ctx.profiler) {
                ctx.profiler.drawcall++;
                ez.Profile.addCommand("drawcall Mesh");
                ctx.profiler.triangle += this.idxCount / 3;
            }
            if (skeleton) {
                if (this.skins) {
                    for (let i = 0; i < this.skins.length; i++) {
                        let skin = this.skins[i];
                        skin.updateBones(skeleton);
                        ctx.shader.bind("BONES", skin.bonesBuffer, true);
                        gl.drawElements(4, this.groups[i + 1] - this.groups[i], 5123, this.groups[i] * 2);
                    }
                    return;
                }
                else {
                    let skin = this.skin;
                    skin.updateBones(skeleton);
                    ctx.shader.bind("BONES", skin.bonesBuffer, true);
                }
            }
            gl.drawElements(4, this.idxCount, 5123, 0);
        }
    }
    ez.Primitive = Primitive;
})(ez || (ez = {}));
var ez;
(function (ez) {
    ez.MAX_BONE = 45;
    ez.Mat3x4Size = 12 * 4;
    ez.Mat3x4IdentityHandle = 1;
    function copyMat3x4TempStack(m) {
        var t = ezasm.tempStackAlloc(ez.Mat3x4Size);
        ezasm.handleToFloatArray(t, 12).set(m);
        return t;
    }
    ez.copyMat3x4TempStack = copyMat3x4TempStack;
    class Transform {
        constructor(v) {
            this.value = v || ez.Mat3x4.identity;
        }
    }
    ez.Transform = Transform;
    class TransformTranslation extends Transform {
        constructor(x, y, z) {
            super();
            this.value = ez.Mat3x4.translate(x, y, z);
        }
    }
    ez.TransformTranslation = TransformTranslation;
    class Renderable {
        constructor() {
            this.visible = true;
        }
        passExclude(pass) { this.passExcludes |= 1 << pass; }
        passInclude(pass) { this.passIncludes |= 1 << pass; }
        isExclude(pass) { return (this.passExcludes && (this.passExcludes & (1 << pass))); }
        isInclude(pass) { return (this.passIncludes && (this.passIncludes & (1 << pass))); }
        draw(pipeline) { }
        update(dt) { return false; }
        get disposed() { return !this.scene; }
        dispose() {
            if (this.scene) {
                this.scene.remove(this);
                this.scene = null;
            }
        }
        setShaderParameter(name, value) {
            if (!this.shaderValues)
                this.shaderValues = {};
            this.shaderValues[name] = value;
        }
    }
    ez.Renderable = Renderable;
    function remapSkin(m, skeleton) {
        var i = 0;
        for (i = 0; i < m.primitives.length; i++) {
            var p = m.primitives[i];
            if (p.skin || p.skins)
                break;
        }
        if (i == m.primitives.length)
            return m;
        var mesh = {
            primitives: []
        };
        mesh.primitives = m.primitives.map(p => {
            if (p.skin || p.skins)
                return p.remapSkin(skeleton);
            return p;
        });
        return mesh;
    }
    class Model extends Renderable {
        constructor(nodes, root, animations) {
            super();
            this.state = 0;
            this.position = 0;
            this.drawables = [];
            this.speed = 1;
            this.nodes = nodes;
            this.root = nodes[root];
            var dict = {};
            animations.forEach(v => dict[v.name] = v);
            this.animations = dict;
            var ctx = this;
            this.materials = [];
            this.root.traverse(function (node, parent) {
                if (node.mesh) {
                    ctx.drawables.push(node);
                    var materials = ctx.materials;
                    for (let i = 0; i < node.mesh.primitives.length; i++) {
                        let m = node.mesh.primitives[i].material;
                        if (materials.indexOf(m) < 0)
                            materials.push(m);
                    }
                }
            }, null);
            this.updateTrans();
        }
        updateTrans() {
            this.root.traverse((node, parent) => node.updateGlobalTrans(parent), null);
            this.root.traverse(node => node.changed = false, null);
        }
        dispose() {
            super.dispose();
            this.stop();
            for (var i = 0; i < this.nodes.length; i++)
                this.nodes[i].dispose();
            this.nodes = null;
            this.drawables = null;
        }
        replaceSkin(name) {
            return __awaiter(this, void 0, void 0, function* () {
                var model = yield ez.loadModelFile(name);
                if (this.disposed) {
                    model.dispose();
                    return;
                }
                var drawables = model.drawables;
                drawables.forEach(n => n.mesh = remapSkin(n.mesh, this.nodes));
                this.drawables = drawables;
                this.materials = model.materials;
                model.dispose();
            });
        }
        addSkin(name) {
            return __awaiter(this, void 0, void 0, function* () {
                var model = yield ez.loadModelFile(name);
                var drawables = model.drawables;
                drawables.forEach(n => n.mesh = remapSkin(n.mesh, this.nodes));
                this.drawables = this.drawables.concat(drawables);
                model.dispose();
            });
        }
        findNode(name) {
            for (let i = 0; i < this.nodes.length; i++) {
                var n = this.nodes[i];
                if (n.name === name)
                    return n;
            }
            return null;
        }
        _update(ani) {
            if (ez.Cache3DAnimationFPS) {
                var frame = (this.position * ez.Cache3DAnimationFPS) | 0;
                if (frame == this.lastFrame)
                    return false;
                if (!ani.frames)
                    ani.setCache();
                this.lastFrame = frame;
                var nodes = this.nodes;
                if (!ani.frames[frame]) {
                    ani.update(nodes, frame / ez.Cache3DAnimationFPS);
                    for (var i = 0, len = ani.nodeIds.length; i < len; i++)
                        nodes[ani.nodeIds[i]].updateTRS();
                    this.updateTrans();
                    var c = ani.frames[frame] = [];
                    for (var i = 0; i < nodes.length; i++) {
                        var n = nodes[i];
                        var v = n.hGlobalTrans;
                        if (v > ez.Mat3x4IdentityHandle) {
                            v = ezasm.poolAllocDebug(ez.Mat3x4Size, 4);
                            ezasm.memcpy(v, n.hGlobalTrans, ez.Mat3x4Size);
                        }
                        c.push(v);
                    }
                }
                else {
                    var cache = ani.frames[frame];
                    for (var i = 0; i < cache.length; i++)
                        nodes[i].setGlobalTrans(cache[i]);
                }
                return true;
            }
            else {
                ani.update(this.nodes, this.position);
                for (var i = 0, len = ani.nodeIds.length; i < len; i++)
                    this.nodes[ani.nodeIds[i]].updateTRS();
                this.updateTrans();
                return true;
            }
        }
        update(dt) {
            dt = dt * this.speed;
            if (!this.playing)
                return false;
            this.position += dt * 0.001;
            var ani = this.playing;
            if (ani.duration <= 0) {
                Log.error(`duration error`);
                return;
            }
            if (!this.loop && this.position > ani.duration) {
                this.position = ani.duration;
                var r = this._update(ani);
                this.playing = null;
                if (this.onStop)
                    this.onStop();
                return r;
            }
            while (this.position > ani.duration)
                this.position -= ani.duration;
            return this._update(ani);
        }
        linkTo(target, nodeName) {
            var node = target.findNode(nodeName);
            if (!node) {
                Log.error(`not find node ${nodeName}`);
                return;
            }
            this.parent = { node: node, model: target };
            let idx = target.nodes.indexOf(node);
            for (let i = 0; i < target.drawables.length; i++) {
                let n = target.drawables[i];
                if (!n.skin)
                    continue;
                let j = n.skin.joints.indexOf(idx);
                if (j >= 0) {
                    this.parent.invSkinMatrix = n.skin.inverseMatrixhandle + j * ez.Mat3x4Size;
                    break;
                }
            }
        }
        draw(pipeline) {
            var drawables = this.drawables;
            var trans = this.transform ? copyMat3x4TempStack(this.transform.value) : ez.Mat3x4IdentityHandle;
            if (this.parent) {
                if (!this.parent.node.hGlobalTrans)
                    return;
                if (trans == ez.Mat3x4IdentityHandle) {
                    trans = ezasm.tempStackAlloc(ez.Mat3x4Size);
                    ezasm.handleToFloatArray(trans, 12).set(ez.Mat3x4.identity);
                }
                if (this.parent.invSkinMatrix)
                    ezasm.mat3x4Mul(trans, this.parent.invSkinMatrix, trans);
                if (this.parent.node.hGlobalTrans > ez.Mat3x4IdentityHandle)
                    ezasm.mat3x4Mul(trans, this.parent.node.hGlobalTrans, trans);
                if (this.parent.model.transform)
                    ezasm.mat3x4Mul(trans, copyMat3x4TempStack(this.parent.model.transform.value), trans);
            }
            for (var i = 0; i < drawables.length; i++)
                drawables[i].draw(pipeline, this.nodes, trans, this.shaderValues);
        }
        play(aniName, loop) {
            if (this.disposed)
                return;
            var ani = this.animations[aniName];
            if (!ani)
                throw new Error("animation not exist!");
            this.lastFrame = -1;
            this.loop = loop;
            this.position = 0;
            if (this.playing == ani)
                return;
            if (ani.initPos)
                ani.reset(this.nodes);
            this.playing = ani;
            this.update(0);
        }
        stop() {
            if (!this.playing)
                return;
            if (this.playing.initPos)
                this.playing.reset(this.nodes);
            this.position = 0;
            this.playing = null;
            this.update(0);
            if (this.onStop)
                this.onStop();
        }
    }
    ez.Model = Model;
    class Node {
        constructor(name, trs, matrix) {
            this.hLocalTrans = 0;
            this.hGlobalTrans = 0;
            this.name = name;
            if (trs) {
                this.setTRS(trs);
            }
            else if (matrix) {
                this.hLocalTrans = ezasm.poolAllocDebug(ez.Mat3x4Size, 1);
                var l = ezasm.handleToFloatArray(this.hLocalTrans, 12);
                l.set(matrix);
            }
            else {
                this.hLocalTrans = ez.Mat3x4IdentityHandle;
            }
        }
        delTransform() {
            if (this.hLocalTrans > ez.Mat3x4IdentityHandle) {
                ezasm.poolFree(this.hLocalTrans);
                if (this.hLocalTrans == this.hGlobalTrans)
                    this.hGlobalTrans = 0;
            }
            if (this.hGlobalTrans > ez.Mat3x4IdentityHandle)
                ezasm.poolFree(this.hGlobalTrans);
            this.hLocalTrans = 0;
            this.hGlobalTrans = 0;
        }
        dispose() {
            this.delTransform();
        }
        draw(pipeline, skeleton, transform, shaderValues) {
            if (this.hide)
                return;
            var mesh = this.mesh;
            var primitives = mesh.primitives;
            if (this.skin) {
                for (var i = 0; i < primitives.length; i++)
                    pipeline.addPrimitive(primitives[i], skeleton, primitives[i].material, transform, shaderValues);
            }
            else {
                var t = transform;
                if (transform > ez.Mat3x4IdentityHandle) {
                    if (this.hGlobalTrans > ez.Mat3x4IdentityHandle) {
                        t = ezasm.tempStackAlloc(ez.Mat3x4Size);
                        ezasm.mat3x4Mul(this.hGlobalTrans, transform, t);
                    }
                }
                else
                    t = this.hGlobalTrans;
                for (var i = 0; i < primitives.length; i++)
                    pipeline.addPrimitive(primitives[i], null, primitives[i].material, t, shaderValues);
            }
        }
        traverse(preFunc, postFunc, checkUsed = true) {
            function t(n, parent) {
                if (preFunc)
                    preFunc(n, parent);
                if (n.children) {
                    for (var i = 0, len = n.children.length; i < len; i++)
                        t(n.children[i], n);
                }
                if (postFunc)
                    postFunc(n, parent);
            }
            t(this, null);
        }
        setTRS(trs) {
            this.delTransform();
            var translation = trs.translation;
            var rotation = trs.rotation;
            var scale = trs.scale;
            if (translation && Math.abs(translation[0]) + Math.abs(translation[1]) + Math.abs(translation[2]) > 0.000001)
                this.translation = new ez.Vec3(translation[0], translation[1], translation[2]);
            if (rotation && (Math.abs(rotation[0]) + Math.abs(rotation[1]) + Math.abs(rotation[2]) > 0.000001 || rotation[3] != 1))
                this.rotation = new ez.Quaternion(rotation[0], rotation[1], rotation[2], rotation[3]);
            if (scale && Math.abs(scale[0] - 1) + Math.abs(scale[1] - 1) + Math.abs(scale[2] - 1) > 0.000001)
                this.scale = new ez.Vec3(scale[0], scale[1], scale[2]);
            this.updateTRS();
        }
        setGlobalTrans(trans) {
            if (!trans) {
                Log.error('global trans is null');
            }
            if (trans == ez.Mat3x4IdentityHandle) {
                if (this.hGlobalTrans > 1 && this.hGlobalTrans != this.hLocalTrans)
                    ezasm.poolFree(this.hGlobalTrans);
                this.hGlobalTrans = ez.Mat3x4IdentityHandle;
            }
            else {
                if (this.hGlobalTrans <= ez.Mat3x4IdentityHandle)
                    this.hGlobalTrans = ezasm.poolAllocDebug(ez.Mat3x4Size, 2);
                ezasm.memcpy(this.hGlobalTrans, trans, ez.Mat3x4Size);
            }
        }
        updateGlobalTrans(parent) {
            if (parent) {
                if (parent.changed)
                    this.changed = true;
                if (this.changed) {
                    if (this.hGlobalTrans > 1 && this.hGlobalTrans != this.hLocalTrans)
                        ezasm.poolFree(this.hGlobalTrans);
                    this.hGlobalTrans = 0;
                }
                if (!this.hGlobalTrans) {
                    if (parent.hGlobalTrans > ez.Mat3x4IdentityHandle) {
                        this.hGlobalTrans = ezasm.poolAllocDebug(ez.Mat3x4Size, 3);
                        ezasm.mat3x4Mul(this.hLocalTrans, parent.hGlobalTrans, this.hGlobalTrans);
                    }
                    else
                        this.hGlobalTrans = this.hLocalTrans;
                }
            }
            else {
                this.hGlobalTrans = this.hLocalTrans;
            }
        }
        updateTRS() {
            if (this.hLocalTrans)
                return;
            this.changed = true;
            var s = this.scale;
            var t = this.translation;
            var r = this.rotation;
            if (!r && !s && !t) {
                this.hLocalTrans = ez.Mat3x4IdentityHandle;
                return;
            }
            this.hLocalTrans = ezasm.mat3x4Identity();
            if (r)
                ezasm.mat3x4FromQuat(r.x, r.y, r.z, r.w, this.hLocalTrans);
            var l = ezasm.handleToFloatArray(this.hLocalTrans, 12);
            if (s) {
                if (s.x !== 1) {
                    l[0] *= s.x;
                    l[4] *= s.x;
                    l[8] *= s.x;
                }
                if (s.y !== 1) {
                    l[1] *= s.y;
                    l[5] *= s.y;
                    l[9] *= s.y;
                }
                if (s.z !== 1) {
                    l[2] *= s.z;
                    l[6] *= s.z;
                    l[10] *= s.z;
                }
            }
            if (t) {
                l[3] = t.x;
                l[7] = t.y;
                l[11] = t.z;
            }
        }
        update(path, value) {
            this.delTransform();
            switch (path) {
                case AnimationTargetPath.translation:
                    var t = this.translation;
                    if (!t)
                        this.translation = new ez.Vec3(value[0], value[1], value[2]);
                    else {
                        t[0] = value[0];
                        t[1] = value[1];
                        t[2] = value[2];
                    }
                    break;
                case AnimationTargetPath.scale:
                    var s = this.scale;
                    if (!s)
                        this.scale = new ez.Vec3(value[0], value[1], value[2]);
                    else {
                        s[0] = value[0];
                        s[1] = value[1];
                        s[2] = value[2];
                    }
                    break;
                case AnimationTargetPath.rotation:
                    var r = this.rotation;
                    if (!r)
                        this.rotation = new ez.Quaternion(value[0], value[1], value[2], value[3]);
                    else {
                        r[0] = value[0];
                        r[1] = value[1];
                        r[2] = value[2];
                        r[3] = value[3];
                    }
                    break;
            }
        }
    }
    ez.Node = Node;
    let AnimationTargetPath;
    (function (AnimationTargetPath) {
        AnimationTargetPath[AnimationTargetPath["translation"] = 0] = "translation";
        AnimationTargetPath[AnimationTargetPath["rotation"] = 1] = "rotation";
        AnimationTargetPath[AnimationTargetPath["scale"] = 2] = "scale";
    })(AnimationTargetPath = ez.AnimationTargetPath || (ez.AnimationTargetPath = {}));
    let AnimationInterpolation;
    (function (AnimationInterpolation) {
        AnimationInterpolation[AnimationInterpolation["LINEAR"] = 0] = "LINEAR";
        AnimationInterpolation[AnimationInterpolation["STEP"] = 1] = "STEP";
        AnimationInterpolation[AnimationInterpolation["CATMULLROMSPLINE"] = 2] = "CATMULLROMSPLINE";
        AnimationInterpolation[AnimationInterpolation["CUBICSPLINE"] = 3] = "CUBICSPLINE";
    })(AnimationInterpolation = ez.AnimationInterpolation || (ez.AnimationInterpolation = {}));
    var tempAniBuffer = 0;
    var tempAniFloats;
    class AnimationChannel {
        constructor(data) {
            if (!tempAniBuffer) {
                tempAniBuffer = ezasm.staticAlloc(12 * 4);
                tempAniFloats = ezasm.handleToFloatArray(tempAniBuffer, 12);
            }
            this.time = data.input;
            this.output = data.output;
            this.count = data.valueCount;
            this.interpolation = data.interpolation;
            this.path = data.path;
            this.nodeId = data.nodeId;
            this.endTime = this.time[this.time.length - 1];
            this.duration = this.endTime - this.time[0];
        }
        update(t, val) {
            var curIdx = 0;
            var time = this.time;
            if (t > this.endTime)
                t = this.endTime;
            while (curIdx < time.length - 2 && t >= time[curIdx + 1])
                curIdx++;
            var count = this.count;
            var u = Math.max(0, t - time[curIdx]) / (time[curIdx + 1] - time[curIdx]);
            var output = this.output;
            if (count == 4) {
                var idx = curIdx * count;
                for (var i = 0; i < 8; i++)
                    tempAniFloats[i] = output[idx + i];
                ezasm.quatLerp(tempAniBuffer, tempAniBuffer + 16, u, tempAniBuffer + 32);
                val[0] = tempAniFloats[8];
                val[1] = tempAniFloats[9];
                val[2] = tempAniFloats[10];
                val[3] = tempAniFloats[11];
            }
            else {
                for (var j = 0; j < count; j++) {
                    let idx = curIdx * count + j;
                    val[j] = ez.lerp(output[idx], output[idx + count], u);
                }
            }
        }
    }
    class Animation {
        constructor(name, initPos, channels) {
            this.name = name;
            this.initPos = initPos;
            this.channels = channels.map(s => new AnimationChannel(s));
            var duration = 0;
            this.channels.forEach(v => duration = Math.max(v.duration, duration));
            this.duration = duration;
            var n = this.channels.map(c => c.nodeId);
            var nodes = this.nodeIds = [];
            n.forEach(i => {
                if (nodes.indexOf(i) < 0)
                    nodes.push(i);
            });
        }
        reset(nodes) {
            var initPos = this.initPos;
            if (!initPos)
                return;
            for (var i = 0; i < initPos.length; i++) {
                nodes[i].setTRS(initPos[i]);
            }
        }
        update(nodes, time) {
            var val = [];
            for (var i = 0, len = this.channels.length; i < len; i++) {
                var c = this.channels[i];
                c.update(time, val);
                var node = nodes[c.nodeId];
                if (node)
                    node.update(c.path, val);
            }
        }
        setCache() {
            this.frames = [];
        }
    }
    ez.Animation = Animation;
    class Skin {
        constructor(s) {
            if (!s)
                return;
            this.joints = s.joints;
            this.jointNames = s.jointNames;
            this.bonesHandle = ezasm.malloc(ez.MAX_BONE * ez.Mat3x4Size);
            this.hInvMatrix = s.inverseMatrixhandle;
            this.bonesBuffer = ezasm.handleToFloatArray(this.bonesHandle, ez.MAX_BONE * 12);
        }
        dispose() {
            ezasm.free(this.bonesHandle);
            this.hInvMatrix = 0;
            this.bonesBuffer = null;
        }
        updateBones(nodes) {
            var joints = this.joints;
            for (var i = 0, len = joints.length; i < len; i++) {
                var t = nodes[joints[i]].hGlobalTrans;
                if (!t) {
                    Log.error("skin error");
                    return;
                }
                if (t == ez.Mat3x4IdentityHandle)
                    ezasm.memcpy(this.bonesHandle + i * ez.Mat3x4Size, this.hInvMatrix + i * ez.Mat3x4Size, ez.Mat3x4Size);
                else
                    ezasm.mat3x4Mul(this.hInvMatrix + i * ez.Mat3x4Size, t, this.bonesHandle + i * ez.Mat3x4Size);
            }
        }
    }
    ez.Skin = Skin;
    ez.initCall(() => {
        var count = ez.getGL().getParameter(36347);
        ez.MAX_BONE = Math.min(120, ((count - 10) / 3) | 0);
        Log.debug(`MAX_VERTEX_UNIFORM_VECTORS: ${count} MAX_BONE: ${ez.MAX_BONE}`);
    }, true);
})(ez || (ez = {}));
var ez;
(function (ez) {
    var mesh;
    var crossMesh;
    function initMesh() {
        if (mesh)
            return;
        mesh = new ez.Primitive();
        mesh.load([{
                index: 0,
                semantic: "POSITION",
                count: 3,
                type: 5126,
                normalized: false,
                offset: 0,
                data: new Float32Array([-0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0])
            },
            {
                index: 0,
                semantic: "TEXCOORD0",
                count: 2,
                type: 5126,
                normalized: false,
                offset: 0,
                data: new Float32Array([0, 0, 0, 1, 1, 1, 1, 0])
            }], 4, new Uint16Array([0, 1, 2, 2, 3, 0]));
    }
    function initCrossMesh() {
        if (crossMesh)
            return;
        crossMesh = new ez.Primitive();
        crossMesh.load([{
                index: 0,
                semantic: "POSITION",
                count: 3,
                type: 5126,
                normalized: false,
                offset: 0,
                data: new Float32Array([-0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0,
                    -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, -0.5, 0.5, 0, 0.5])
            },
            {
                index: 0,
                semantic: "TEXCOORD0",
                count: 2,
                type: 5126,
                normalized: false,
                offset: 0,
                data: new Float32Array([0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0])
            }], 8, new Uint16Array([0, 1, 2, 2, 3, 0, 2, 1, 0, 0, 3, 2, 4, 5, 6, 6, 7, 4, 6, 5, 4, 4, 7, 6]));
    }
    class Billboard extends ez.Renderable {
        constructor(material) {
            super();
            this.type = 0;
            initMesh();
            this.material = material;
        }
        linkTo(target) {
            this.target = target;
        }
        draw(pipeline) {
            var transform = ez.copyMat3x4TempStack(this.transform.value);
            if (this.type == 0) {
                var camera = pipeline.camera;
                if (!camera.hViewTranspose) {
                    camera.hViewTranspose = ezasm.poolAlloc(ez.Mat3x4Size);
                    ezasm.handleToFloatArray(camera.hViewTranspose, 12).set(ez.Mat3x4.fromMat4(pipeline.camera.view, true));
                }
                ezasm.mat3x4Mul(transform, camera.hViewTranspose, transform);
            }
            if (this.position) {
                var p = this.position;
                var v = ezasm.handleToFloatArray(transform, 12);
                v[3] += p.x;
                v[7] += p.y;
                v[11] += p.z;
            }
            if (this.target && this.target.transform)
                ezasm.mat3x4Mul(transform, ez.copyMat3x4TempStack(this.target.transform.value), transform);
            pipeline.addPrimitive(mesh, null, this.material, transform, this.shaderValues);
        }
    }
    ez.Billboard = Billboard;
    class CrossMesh extends ez.Renderable {
        constructor(material) {
            super();
            initCrossMesh();
            this.material = material;
        }
        draw(pipeline) {
            var transform = ez.copyMat3x4TempStack(this.transform.value);
            if (this.dimension) {
                var v = ezasm.handleToFloatArray(transform, 12);
                var x = this.dimension.x;
                v[0] *= x;
                v[4] *= x;
                v[8] *= x;
                var y = this.dimension.y;
                v[1] *= y;
                v[5] *= y;
                v[9] *= y;
                var z = this.dimension.z;
                v[2] *= z;
                v[6] *= z;
                v[10] *= z;
            }
            pipeline.addPrimitive(crossMesh, null, this.material, transform, this.shaderValues);
        }
    }
    ez.CrossMesh = CrossMesh;
})(ez || (ez = {}));
var ez;
(function (ez) {
    class Camera {
        constructor() {
            this.eye = new ez.Vec3(0, 0, 0);
            this.dir = new ez.Vec3(1, 0, 0);
            this.up = new ez.Vec3(0, 1, 0);
        }
        update() {
            this.changed = true;
            if (this.hViewTranspose) {
                ezasm.poolFree(this.hViewTranspose);
                this.hViewTranspose = 0;
            }
            this.view = ez.Mat4.cameraView(this.eye, this.dir, this.up);
        }
    }
    ez.Camera = Camera;
    class OrthoCamera extends Camera {
        constructor(w, h, zn, zf) {
            super();
            this.width = w;
            this.height = h;
            this.zNear = zn;
            this.zFar = zf;
        }
        update() {
            super.update();
            this.projection = ez.Mat4.ortho(this.width, this.height, this.zNear, this.zFar);
            this.viewProj = ez.Mat4.mul(this.view, this.projection);
        }
    }
    ez.OrthoCamera = OrthoCamera;
    class PerspectiveCamera extends Camera {
        constructor(fov, aspect, near = 0.1, far = 1000) {
            super();
            this.fov = fov;
            this.aspect = aspect;
            this.near = near;
            this.far = far;
        }
        update() {
            super.update();
            this.projection = ez.Mat4.perspective(this.fov, this.aspect, this.near, this.far);
            this.viewProj = ez.Mat4.mul(this.view, this.projection);
        }
    }
    ez.PerspectiveCamera = PerspectiveCamera;
})(ez || (ez = {}));
var gltf;
(function (gltf) {
    let DataCount;
    (function (DataCount) {
        DataCount[DataCount["SCALAR"] = 1] = "SCALAR";
        DataCount[DataCount["VEC2"] = 2] = "VEC2";
        DataCount[DataCount["VEC3"] = 3] = "VEC3";
        DataCount[DataCount["VEC4"] = 4] = "VEC4";
        DataCount[DataCount["MAT2"] = 4] = "MAT2";
        DataCount[DataCount["MAT3"] = 9] = "MAT3";
        DataCount[DataCount["MAT4"] = 16] = "MAT4";
    })(DataCount = gltf.DataCount || (gltf.DataCount = {}));
    class Target {
    }
    gltf.Target = Target;
    function getAccessorData(file, accessor) {
        var bufferView = file.bufferViews[accessor.bufferView];
        switch (accessor.componentType) {
            case 5126:
                accessor.data = new Float32Array(file.buffers[0].data, bufferView.byteOffset, bufferView.byteLength >> 2);
                break;
            case 5122:
                accessor.data = new Int16Array(file.buffers[0].data, bufferView.byteOffset, bufferView.byteLength >> 1);
                break;
            case 5123:
                accessor.data = new Uint16Array(file.buffers[0].data, bufferView.byteOffset, bufferView.byteLength >> 1);
                break;
            case 5120:
                accessor.data = new Int8Array(file.buffers[0].data, bufferView.byteOffset, bufferView.byteLength);
                break;
            case 5121:
                accessor.data = new Uint8Array(file.buffers[0].data, bufferView.byteOffset, bufferView.byteLength);
                break;
        }
    }
    function createModel(data) {
        var nodes = [];
        for (let i = 0; i < data.nodes.length; i++) {
            var n = data.nodes[i];
            if (n.matrix)
                nodes[i] = new ez.Node(n.name, null, ez.Mat3x4.fromMat4(n.matrix, true));
            else
                nodes[i] = new ez.Node(n.name, n, null);
            if (typeof n.mesh === "number") {
                nodes[i].mesh = data.meshes[n.mesh];
                if (typeof n.skin === "number") {
                    nodes[i].skin = data.skins[n.skin];
                }
            }
        }
        for (let i = 0; i < data.nodes.length; i++) {
            n = data.nodes[i];
            if (n.children) {
                var node = nodes[i];
                node.children = n.children.map(idx => nodes[idx]);
                node.children.forEach(t => t.parent = node);
            }
        }
        return new ez.Model(nodes, data.root, data.animations);
    }
    var models = {};
    function loadModel(res, texPath) {
        return __awaiter(this, void 0, void 0, function* () {
            var gl = ez.getGL();
            function createPrimitive(prim) {
                var channels = [];
                var count = 0;
                for (var k in prim.attributes) {
                    var args = k.split("_");
                    var semantic = args[0];
                    if (semantic == "COLOR")
                        continue;
                    if (semantic == "TEXCOORD")
                        semantic += args[1];
                    var accessor = jsonFile.accessors[prim.attributes[k]];
                    if (semantic == "POSITION")
                        count = accessor.count;
                    var channel = {
                        index: 0,
                        semantic: semantic,
                        count: DataCount[accessor.type],
                        type: accessor.componentType,
                        normalized: !!accessor.normalized,
                        offset: 0,
                        data: accessor.data
                    };
                    if (semantic == "JOINTS")
                        channel.type = 5121;
                    channels.push(channel);
                }
                var primitive = new ez.Primitive();
                primitive.load(channels, count, jsonFile.accessors[prim.indices].data);
                primitive.material = materials[prim.material];
                return primitive;
            }
            function createMesh(meshData) {
                return { primitives: meshData.primitives.map(p => createPrimitive(p)) };
            }
            function createMaterial(m) {
                var args = m;
                switch (args.alphaMode) {
                    case "OPAQUE":
                        args.alphaMode = ez.AlphaBlendMode.Opaque;
                        break;
                    case "BLEND":
                        args.alphaMode = ez.AlphaBlendMode.Transparent;
                        break;
                    case "ADD":
                        args.alphaMode = ez.AlphaBlendMode.Add;
                        break;
                    default: Log.warn(`unknown alpha mode: ${args.alphaMode} material: ${m.name}`);
                }
                return ez.ShaderLib.createMaterial(m.shadingModel, args);
            }
            function createAnimation(animation, nodes) {
                var channels = animation.channels.map(v => {
                    var sampler = animation.samplers[v.sampler];
                    return {
                        nodeId: v.target.node,
                        path: ez.AnimationTargetPath[v.target.path],
                        input: sampler.inputData.data,
                        output: sampler.outputData.data,
                        valueCount: DataCount[sampler.outputData.type],
                        interpolation: ez.AnimationInterpolation[sampler.interpolation],
                    };
                });
                if (!animation.initPos) {
                    animation.initPos = nodes;
                }
                else {
                    var initPos = animation.initPos;
                    for (var i = 0; i < nodes.length; i++) {
                        if (!initPos[i])
                            initPos[i] = nodes[i];
                    }
                }
                var ani = new ez.Animation(animation.name, animation.initPos, channels);
                if (ez.Cache3DAnimationFPS)
                    ani.setCache();
                return ani;
            }
            var materials = [];
            var meshes = [];
            var nodes = [];
            var jsonFile;
            yield res.loadAsync();
            jsonFile = res.getData();
            if (texPath) {
                var bin = ez.getExternalRes(texPath + jsonFile.buffers[0].uri, 6);
                yield bin.loadAsync();
                jsonFile.buffers[0].data = bin.getData();
                bin.release();
            }
            else
                jsonFile.buffers[0].data = res.bin;
            var i, j;
            for (i = 0; i < jsonFile.accessors.length; i++) {
                var accessor = jsonFile.accessors[i];
                getAccessorData(jsonFile, jsonFile.accessors[i]);
                accessor.normalized = !!accessor.normalized;
            }
            if (jsonFile.skins) {
                for (i = 0; i < jsonFile.skins.length; i++) {
                    let skin = jsonFile.skins[i];
                    let buffer = jsonFile.accessors[skin.inverseBindMatrices].data;
                    let count = buffer.length >> 4;
                    skin.inverseMatrixhandle = ezasm.malloc(count * 12 * 4);
                    skin.jointNames = skin.joints.map(idx => jsonFile.nodes[idx].name);
                    var outBuf = ezasm.handleToFloatArray(skin.inverseMatrixhandle, count * 12);
                    var idx = 0;
                    for (j = 0; j < buffer.length; j += 16) {
                        var m = ez.Mat3x4.fromMat4(new Float32Array(buffer.buffer, buffer.byteOffset + j * 4, 16), true);
                        outBuf.set(m, idx);
                        idx += 12;
                    }
                }
            }
            if (jsonFile.animations) {
                for (i = 0; i < jsonFile.animations.length; i++) {
                    var ani = jsonFile.animations[i];
                    ani.samplers.forEach(v => {
                        v.inputData = jsonFile.accessors[v.input];
                        v.outputData = jsonFile.accessors[v.output];
                    });
                }
            }
            for (let i = 0; i < jsonFile.materials.length; i++) {
                if (texPath)
                    jsonFile.materials[i].texturePath = texPath;
                materials.push(createMaterial(jsonFile.materials[i]));
            }
            for (let i = 0; i < jsonFile.meshes.length; i++) {
                meshes.push(createMesh(jsonFile.meshes[i]));
            }
            for (let i = 0; i < jsonFile.nodes.length; i++) {
                let n = jsonFile.nodes[i];
                if (typeof n.mesh === "number" && typeof n.skin === "number") {
                    let mesh = meshes[n.mesh];
                    let s = jsonFile.skins[n.skin];
                    let skin = new ez.Skin(s);
                    for (let j = 0; j < mesh.primitives.length; j++) {
                        mesh.primitives[j].skin = skin;
                        if (skin.joints.length > ez.MAX_BONE)
                            mesh.primitives[j].splitSkin(ez.MAX_BONE);
                    }
                }
            }
            var animations = jsonFile.animations ? jsonFile.animations.map(v => createAnimation(v, jsonFile.nodes)) : [];
            return { meshes: meshes, nodes: jsonFile.nodes, skins: jsonFile.skins, root: jsonFile.scenes[jsonFile.scene].nodes[0], animations: animations, materials: materials };
        });
    }
    function load(name, onFinish, onError) {
        return __awaiter(this, void 0, void 0, function* () {
            if (models[name]) {
                if (models[name].then)
                    models[name].then(r => {
                        models[name] = r;
                        onFinish(createModel(r));
                    });
                else
                    onFinish(createModel(models[name]));
                return;
            }
            try {
                if (name.substring(0, 4) == "http") {
                    let res = ez.getExternalRes(name, 2);
                    let texPath = name.substring(0, name.lastIndexOf('/') + 1);
                    let m = yield loadModel(res, texPath);
                    onFinish(createModel(m));
                }
                else {
                    let res = ez.getRes(name);
                    if (!res) {
                        onError(`${name} is not exist.`);
                        return;
                    }
                    models[name] = loadModel(res);
                    models[name].then(function (r) {
                        models[name] = r;
                        onFinish(createModel(r));
                    });
                }
            }
            catch (e) {
                onError(e.message);
            }
        });
    }
    gltf.load = load;
})(gltf || (gltf = {}));
var ez;
(function (ez) {
    ez.TexturePath = "texture/";
    let AlphaBlendMode;
    (function (AlphaBlendMode) {
        AlphaBlendMode[AlphaBlendMode["Opaque"] = 0] = "Opaque";
        AlphaBlendMode[AlphaBlendMode["Transparent"] = 1] = "Transparent";
        AlphaBlendMode[AlphaBlendMode["Add"] = 2] = "Add";
    })(AlphaBlendMode = ez.AlphaBlendMode || (ez.AlphaBlendMode = {}));
    function hash(s) {
        var h = 0;
        for (var i = 0; i < s.length; i++)
            h = ((h + s.charCodeAt(i)) * 7) & 0xffffff;
        return h & 0xffff;
    }
    class Material {
        constructor(name, shader) {
            this.sortKey = 0;
            this.shaderFlags = 0;
            this.alphaMode = AlphaBlendMode.Opaque;
            this.depthMode = 0;
            this.uniforms = {};
            this.dynamicUniforms = [];
            this.textures = [];
            this.name = name;
            this.shaderModel = shader;
        }
        setTexture(name, args, flag) {
            var t = args[name];
            var extPath = args.texturePath;
            if (t) {
                var r;
                if (extPath)
                    r = ez.getExternalRes(extPath + t, 11);
                else {
                    var idx = t.lastIndexOf('.');
                    r = ez.getRes(ez.TexturePath + (idx > 0 ? t.substring(0, idx) : t));
                }
                if (r.state == 1)
                    r.load();
                this.textures.push({ name: name, texture: r.getData() });
                this.shaderFlags |= flag;
                this.sortKey |= hash(r.id);
            }
        }
    }
    ez.Material = Material;
})(ez || (ez = {}));
var ez;
(function (ez) {
    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    ez.clamp = clamp;
    function lerp(a, b, alpha) {
        return a * (1 - alpha) + b * alpha;
    }
    ez.lerp = lerp;
    class Vec3 extends Array {
        constructor(x, y, z) {
            super(3);
            this[0] = x || 0;
            this[1] = y || 0;
            this[2] = z || 0;
        }
        get x() {
            return this[0];
        }
        set x(v) {
            this[0] = v;
        }
        get y() {
            return this[1];
        }
        set y(v) {
            this[1] = v;
        }
        get z() {
            return this[2];
        }
        set z(v) {
            this[2] = v;
        }
        toArray() {
            return this;
        }
        add(v) {
            this[0] += v[0];
            this[1] += v[1];
            this[2] += v[2];
            return this;
        }
        sub(v) {
            this[0] -= v[0];
            this[1] -= v[1];
            this[2] -= v[2];
            return this;
        }
        mul(t) {
            this[0] *= t;
            this[1] *= t;
            this[2] *= t;
            return this;
        }
        dot(v) {
            return this[0] * v[0] + this[1] * v[1] + this[2] * v[2];
        }
        cross(v) {
            var x = this[0];
            var y = this[1];
            var z = this[2];
            this[0] = y * v[2] - z * v[1];
            this[1] = z * v[0] - x * v[2];
            this[2] = x * v[1] - y * v[0];
            return this;
        }
        distanceSquared(v) {
            var dx = this[0] - v[0];
            var dy = this[1] - v[1];
            var dz = this[2] - v[2];
            return dx * dx + dy * dy + dz * dz;
        }
        distance(v) {
            return Math.sqrt(this.distanceSquared(v));
        }
        min(v) {
            this[0] = Math.min(this[0], v[0]);
            this[1] = Math.min(this[1], v[1]);
            this[2] = Math.min(this[2], v[2]);
            return this;
        }
        max(v) {
            this[0] = Math.max(this[0], v[0]);
            this[1] = Math.max(this[1], v[1]);
            this[2] = Math.max(this[2], v[2]);
            return this;
        }
        normalize() {
            var t = 1 / Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2]);
            this[0] *= t;
            this[1] *= t;
            this[2] *= t;
            return this;
        }
        clone() {
            return new Vec3(this[0], this[1], this[2]);
        }
        transform(m) {
            var x = this[0];
            var y = this[1];
            var z = this[2];
            this[0] = x * m[0] + y * m[1] + z * m[2] + m[3];
            this[1] = x * m[4] + y * m[5] + z * m[6] + m[7];
            this[2] = x * m[8] + y * m[9] + z * m[10] + m[11];
        }
        static min(v1, v2) {
            return new Vec3(Math.min(v1[0], v2[0]), Math.min(v1[1], v2[1]), Math.min(v1[2], v2[2]));
        }
        static max(v1, v2) {
            return new Vec3(Math.max(v1[0], v2[0]), Math.max(v1[1], v2[1]), Math.max(v1[2], v2[2]));
        }
        static add(v1, v2) {
            return new Vec3(v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]);
        }
        static sub(v1, v2) {
            return new Vec3(v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]);
        }
        static cross(v1, v2) {
            return new Vec3(v1[1] * v2[2] - v1[2] * v2[1], v1[2] * v2[0] - v1[0] * v2[2], v1[0] * v2[1] - v1[1] * v2[0]);
        }
        static lerp(v1, v2, t) {
            return new Vec3((v2[0] - v1[0]) * t + v1[0], (v2[1] - v1[1]) * t + v1[1], (v2[2] - v1[2]) * t + v1[2]);
        }
    }
    Vec3.axisX = new Vec3(1, 0, 0);
    Vec3.axisY = new Vec3(0, 1, 0);
    Vec3.axisZ = new Vec3(0, 0, 1);
    ez.Vec3 = Vec3;
    class Vec4 extends Array {
        get x() {
            return this[0];
        }
        set x(v) {
            this[0] = v;
        }
        get y() {
            return this[1];
        }
        set y(v) {
            this[1] = v;
        }
        get z() {
            return this[2];
        }
        set z(v) {
            this[2] = v;
        }
        get w() {
            return this[3];
        }
        set w(v) {
            this[3] = v;
        }
        toArray() {
            return this;
        }
        constructor(x, y, z, w) {
            super(4);
            this[0] = x || 0;
            this[1] = y || 0;
            this[2] = z || 0;
            this[3] = w || 1;
        }
        static formVec3(v) {
            return new Vec4(v[0], v[1], v[2], 1);
        }
        transform(m) {
            var x = this[0];
            var y = this[1];
            var z = this[2];
            var w = this[3];
            this[0] = x * m[0] + y * m[1] + z * m[2] + w * m[3];
            this[1] = x * m[4] + y * m[5] + z * m[6] + w * m[7];
            this[2] = x * m[8] + y * m[9] + z * m[10] + w * m[11];
            this[3] = x * m[12] + y * m[13] + z * m[14] + w * m[15];
        }
    }
    ez.Vec4 = Vec4;
    class Quaternion extends Vec4 {
        static rotateX(a) {
            a *= 0.5;
            return new Quaternion(Math.sin(a), 0, 0, Math.cos(a));
        }
        static rotateY(a) {
            a *= 0.5;
            return new Quaternion(0, Math.sin(a), 0, Math.cos(a));
        }
        static rotateZ(a) {
            a *= 0.5;
            return new Quaternion(0, 0, Math.sin(a), Math.cos(a));
        }
        static rotateAxis(axis, a) {
            a *= 0.5;
            var s = Math.sin(a);
            return new Quaternion(axis.x * s, axis.y * s, axis.z * s, Math.cos(a));
        }
        clone() {
            return new Quaternion(this.x, this.y, this.z, this.w);
        }
        isZero() {
            return this.x === 0 && this.y === 0 && this.z === 0 && this.w === 1;
        }
        mul(q) {
            var x = this[0];
            var y = this[1];
            var z = this[2];
            var w = this[3];
            this[0] = w * q[0] + x * q[3] + y * q[2] - z * q[1];
            this[1] = w * q[1] + y * q[3] + z * q[0] - x * q[2];
            this[2] = w * q[2] + z * q[3] + x * q[1] - y * q[0];
            this[3] = w * q[3] - x * q[0] - y * q[1] - z * q[2];
            return this;
        }
        static lerp(v1, v2, t) {
            return new Quaternion((v2.x - v1.x) * t + v1.x, (v2.y - v1.y) * t + v1.y, (v2.z - v1.z) * t + v1.z, (v2.w - v1.w) * t + v1.w);
        }
        static slerp(v1, v2, t) {
            let ax = v1.x, ay = v1.y, az = v1.z, aw = v1.w;
            let bx = v2.x, by = v2.y, bz = v2.z, bw = v2.w;
            let omega, cosom, sinom, scale0, scale1;
            cosom = ax * bx + ay * by + az * bz + aw * bw;
            if (cosom < 0) {
                cosom = -cosom;
                bx = -bx;
                by = -by;
                bz = -bz;
                bw = -bw;
            }
            if ((1 - cosom) > 0.000001) {
                omega = Math.acos(cosom);
                sinom = Math.sin(omega);
                scale0 = Math.sin((1 - t) * omega) / sinom;
                scale1 = Math.sin(t * omega) / sinom;
            }
            else {
                scale0 = 1 - t;
                scale1 = t;
            }
            return new Quaternion(scale0 * ax + scale1 * bx, scale0 * ay + scale1 * by, scale0 * az + scale1 * bz, scale0 * aw + scale1 * bw);
        }
        static mul(p, q) {
            return new Quaternion(p.w * q[0] + p.x * q[3] + p.y * q[2] - p.z * q[1], p.w * q[1] + p.y * q[3] + p.z * q[0] - p.x * q[2], p.w * q[2] + p.z * q[3] + p.x * q[1] - p.y * q[0], p.w * q[3] - p.x * q[0] - p.y * q[1] - p.z * q[2]);
        }
    }
    ez.Quaternion = Quaternion;
    let Mat3x4;
    (function (Mat3x4) {
        Mat3x4.identity = [1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0];
        function makeIdentity() {
            return [1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0];
        }
        Mat3x4.makeIdentity = makeIdentity;
        function rotateX(a) {
            var c = Math.cos(a);
            var s = Math.sin(a);
            return [1, 0, 0, 0,
                0, c, -s, 0,
                0, s, c, 0];
        }
        Mat3x4.rotateX = rotateX;
        function rotateY(a) {
            var c = Math.cos(a);
            var s = Math.sin(a);
            return [c, 0, s, 0,
                0, 1, 0, 0,
                -s, 0, c, 0];
        }
        Mat3x4.rotateY = rotateY;
        function rotateZ(a) {
            var c = Math.cos(a);
            var s = Math.sin(a);
            return [c, -s, 0, 0,
                s, c, 0, 0,
                0, 0, 1, 0];
        }
        Mat3x4.rotateZ = rotateZ;
        function translate(x, y, z) {
            return [1, 0, 0, x,
                0, 1, 0, y,
                0, 0, 1, z];
        }
        Mat3x4.translate = translate;
        function scale(sx, sy, sz) {
            return [sx, 0, 0, 0,
                0, sy, 0, 0,
                0, 0, sz, 0];
        }
        Mat3x4.scale = scale;
        function clone(m) {
            return m.concat();
        }
        Mat3x4.clone = clone;
        function transpose(m) {
            return [m[0], m[4], m[8], 0,
                m[1], m[5], m[9], 0,
                m[2], m[6], m[10], 0];
        }
        Mat3x4.transpose = transpose;
        function fromQuaternion(q, result) {
            let x = q[0], y = q[1], z = q[2], w = q[3];
            let x2 = x + x;
            let y2 = y + y;
            let z2 = z + z;
            let xx = x * x2;
            let xy = x * y2;
            let xz = x * z2;
            let yy = y * y2;
            let yz = y * z2;
            let zz = z * z2;
            let wx = w * x2;
            let wy = w * y2;
            let wz = w * z2;
            if (!result) {
                result = [1 - (yy + zz), xy - wz, xz + wy, 0,
                    xy + wz, 1 - (xx + zz), yz - wx, 0,
                    xz - wy, yz + wx, 1 - (xx + yy), 0];
            }
            else {
                result[0] = 1 - (yy + zz);
                result[1] = xy - wz;
                result[2] = xz + wy;
                result[3] = 0;
                result[4] = xy + wz;
                result[5] = 1 - (xx + zz);
                result[6] = yz - wx;
                result[7] = 0;
                result[8] = xz - wy;
                result[9] = yz + wx;
                result[10] = 1 - (xx + yy);
                result[11] = 0;
            }
            return result;
        }
        Mat3x4.fromQuaternion = fromQuaternion;
        function fromMat4(m, transpose, result) {
            if (!result)
                result = new Array(12);
            if (!transpose) {
                for (var i = 0; i < 12; i++)
                    result[i] = m[i];
            }
            else {
                result[0] = m[0];
                result[1] = m[4];
                result[2] = m[8];
                result[3] = m[12];
                result[4] = m[1];
                result[5] = m[5];
                result[6] = m[9];
                result[7] = m[13];
                result[8] = m[2];
                result[9] = m[6];
                result[10] = m[10];
                result[11] = m[14];
            }
            return result;
        }
        Mat3x4.fromMat4 = fromMat4;
        function append(m1, m2) {
            var t1 = m1[0];
            var t2 = m1[4];
            var t3 = m1[8];
            m1[0] = t1 * m2[0] + t2 * m2[1] + t3 * m2[2];
            m1[4] = t1 * m2[4] + t2 * m2[5] + t3 * m2[6];
            m1[8] = t1 * m2[8] + t2 * m2[9] + t3 * m2[10];
            t1 = m1[1];
            t2 = m1[5];
            t3 = m1[9];
            m1[1] = t1 * m2[0] + t2 * m2[1] + t3 * m2[2];
            m1[5] = t1 * m2[4] + t2 * m2[5] + t3 * m2[6];
            m1[9] = t1 * m2[8] + t2 * m2[9] + t3 * m2[10];
            t1 = m1[2];
            t2 = m1[6];
            t3 = m1[10];
            m1[2] = t1 * m2[0] + t2 * m2[1] + t3 * m2[2];
            m1[6] = t1 * m2[4] + t2 * m2[5] + t3 * m2[6];
            m1[10] = t1 * m2[8] + t2 * m2[9] + t3 * m2[10];
            t1 = m1[3];
            t2 = m1[7];
            t3 = m1[11];
            m1[3] = t1 * m2[0] + t2 * m2[1] + t3 * m2[2] + m2[3];
            m1[7] = t1 * m2[4] + t2 * m2[5] + t3 * m2[6] + m2[7];
            m1[11] = t1 * m2[8] + t2 * m2[9] + t3 * m2[10] + m2[11];
            return m1;
        }
        Mat3x4.append = append;
        function mul(m1, m2, result) {
            var i, j, k;
            var t1, t2, t3;
            if (!result)
                result = new Array(12);
            for (i = 0; i < 3; i++) {
                t1 = m1[0 + i];
                t2 = m1[4 + i];
                t3 = m1[8 + i];
                for (j = 0; j < 3; j++) {
                    k = j * 4;
                    result[k + i] = t1 * m2[k] + t2 * m2[k + 1] + t3 * m2[k + 2];
                }
            }
            t1 = m1[0 + 3];
            t2 = m1[4 + 3];
            t3 = m1[8 + 3];
            for (j = 0; j < 3; j++) {
                k = j * 4;
                result[k + 3] = t1 * m2[k] + t2 * m2[k + 1] + t3 * m2[k + 2] + m2[k + 3];
            }
            return result;
        }
        Mat3x4.mul = mul;
    })(Mat3x4 = ez.Mat3x4 || (ez.Mat3x4 = {}));
    let Mat4;
    (function (Mat4) {
        function cameraView(eye, dir, up) {
            var zAxis = new Vec3(-dir.x, -dir.y, -dir.z);
            var xAxis = Vec3.cross(up, zAxis);
            var yAxis = Vec3.cross(zAxis, xAxis);
            return [xAxis.x, xAxis.y, xAxis.z, -xAxis.dot(eye),
                yAxis.x, yAxis.y, yAxis.z, -yAxis.dot(eye),
                zAxis.x, zAxis.y, zAxis.z, -zAxis.dot(eye),
                0, 0, 0, 1];
        }
        Mat4.cameraView = cameraView;
        function perspective(fov, aspect, zn, zf) {
            var yScale = 1 / Math.tan(fov * 0.5);
            var xScale = yScale / aspect;
            var fn = zf / (zn - zf);
            return [xScale, 0, 0, 0,
                0, yScale, 0, 0,
                0, 0, fn, zn * fn,
                0, 0, -1, 0];
        }
        Mat4.perspective = perspective;
        function ortho(w, h, zn, zf) {
            var z = 1 / (zn - zf);
            return [2 / w, 0, 0, 0,
                0, 2 / h, 0, 0,
                0, 0, z, zn * z,
                0, 0, 0, 1];
        }
        Mat4.ortho = ortho;
        function mul(m1, m2, result) {
            var i, j;
            if (!result)
                result = new Array(16);
            for (i = 0; i < 4; i++) {
                for (j = 0; j < 4; j++) {
                    var k = j * 4;
                    result[k + i] = m1[i] * m2[k] + m1[4 + i] * m2[k + 1] + m1[8 + i] * m2[k + 2] + m1[12 + i] * m2[k + 3];
                }
            }
            return result;
        }
        Mat4.mul = mul;
        function mul2(m1, m2, result = null) {
            var i, j;
            var t1, t2, t3;
            if (!result)
                result = new Array(16);
            for (i = 0; i < 4; i++) {
                t1 = m1[i];
                t2 = m1[4 + i];
                t3 = m1[8 + i];
                for (j = 0; j < 4; j++) {
                    var k = j * 4;
                    result[k + i] = t1 * m2[k] + t2 * m2[k + 1] + t3 * m2[k + 2];
                    if (i == 3)
                        result[k + 3] += m2[k + 3];
                }
            }
            return result;
        }
        Mat4.mul2 = mul2;
        function transpose(m) {
            return [m[0], m[4], m[8], m[12],
                m[1], m[5], m[9], m[13],
                m[2], m[6], m[10], m[14],
                m[3], m[7], m[11], m[15]];
        }
        Mat4.transpose = transpose;
        function append(m1, m2) {
            var i, j;
            var t1, t2, t3, t4;
            for (i = 0; i < 4; i++) {
                t1 = m1[i];
                t2 = m1[4 + i];
                t3 = m1[8 + i];
                t4 = m1[12 + i];
                for (j = 0; j < 4; j++) {
                    var k = j * 4;
                    m1[k + i] = t1 * m2[k] + t2 * m2[k + 1] + t3 * m2[k + 2] + t4 * m2[k + 3];
                }
            }
            return m1;
        }
        Mat4.append = append;
        function fromMat3x4(m, result) {
            if (!result)
                result = new Array(16);
            for (var i = 0; i < 12; i++)
                result[i] = m[i];
            result[12] = result[13] = result[14] = 0;
            result[15] = 1;
            return result;
        }
        Mat4.fromMat3x4 = fromMat3x4;
        function clone(m) {
            return m.concat();
        }
        Mat4.clone = clone;
    })(Mat4 = ez.Mat4 || (ez.Mat4 = {}));
})(ez || (ez = {}));
var ez;
(function (ez) {
    function createMaterialV1(shader, alphaMode, diffuseMap, normalMap, specularMap, occlusionMap, reflectMap, emissiveMap, diffuseFactor, opacity, specularLevel, shininess, extras) {
        var args = {};
        args.shadingModel = "standard";
        args.alphaMode = alphaMode;
        if (diffuseMap)
            args.diffuseMap = diffuseMap;
        if (normalMap)
            args.normalMap = normalMap;
        if (specularMap)
            args.specularMap = specularMap;
        if (occlusionMap)
            args.occlusionMap = occlusionMap;
        if (reflectMap)
            args.reflectMap = reflectMap;
        if (emissiveMap)
            args.emissiveMap = emissiveMap;
        args.diffuseFactor = diffuseFactor;
        args.specularLevel = specularLevel;
        args.shininess = shininess;
        args.extras = extras;
        if (alphaMode == ez.AlphaBlendMode.Transparent)
            args.opacity = opacity;
        return args;
    }
    function createMaterialV2(shadingModel, name, args) {
        args.name = name;
        args.shadingModel = shadingModel;
        return args;
    }
    var componentTypes;
    function createAccessor(storeType, componentType, type, count, normalized, dataPos, scalePos, offsetPos, buffer) {
        var output;
        if (storeType == 0) {
            switch (componentType) {
                case 1:
                    output = new Int8Array(buffer, dataPos, count * type);
                    break;
                case 2:
                    output = new Uint8Array(buffer, dataPos, count * type);
                    break;
                case 3:
                    output = new Int16Array(buffer, dataPos, count * type);
                    break;
                case 4:
                    output = new Uint16Array(buffer, dataPos, count * type);
                    break;
                case 5:
                    output = new Float32Array(buffer, dataPos, count * type);
                    break;
            }
        }
        else if (storeType == 1) {
        }
        else if (storeType == 2) {
            let input = new Uint16Array(buffer, dataPos);
            var scale = new Float32Array(buffer, scalePos);
            var offset = new Float32Array(buffer, offsetPos);
            output = new Float32Array(count * type);
            var idx = 0;
            for (var i = 0; i < count; i++) {
                for (var j = 0; j < type; j++) {
                    output[idx] = input[idx] * scale[j] + offset[j];
                    idx++;
                }
            }
        }
        else if (storeType == 3) {
            let input = new Int16Array(buffer, dataPos);
            output = new Float32Array(count * type);
            for (var i = 0; i < count; i++) {
                var x = input[i * 2] * (1 / 32767);
                var y = input[i * 2 + 1];
                var sign = y & 1;
                y = (y >> 1) * (1 / 16383);
                var z = sign ? -Math.sqrt(1 - x * x - y * y) : Math.sqrt(1 - x * x - y * y);
                output[i * 3] = x;
                output[i * 3 + 1] = y;
                output[i * 3 + 2] = z;
            }
        }
        return {
            type: componentTypes[componentType],
            count: type,
            normalized: !!normalized,
            data: output,
        };
    }
    function createPrimitive(material, attributes, indices, buffer, materials) {
        if (!componentTypes) {
            componentTypes = [];
            componentTypes[1] = 5120;
            componentTypes[5] = 5126;
            componentTypes[3] = 5122;
            componentTypes[2] = 5121;
            componentTypes[4] = 5123;
        }
        var channels = [];
        var count = 0;
        for (var i = 0; i < attributes.length; i++) {
            var semantic = ez.SemanticIndex[attributes[i][0]];
            var args = attributes[i][1];
            var accessor = createAccessor(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], buffer);
            if (semantic == "POSITION")
                count = args[3];
            var channel = {
                index: 0,
                semantic: semantic,
                count: accessor.count,
                type: accessor.type,
                normalized: accessor.normalized,
                offset: 0,
                data: accessor.data
            };
            channels.push(channel);
        }
        var primitive = new ez.Primitive();
        primitive.load(channels, count, new Uint16Array(buffer, indices[0], indices[1]));
        primitive.material = materials[material];
        return primitive;
    }
    function createMesh(prims, buffer, materials) {
        return { primitives: prims.map(p => createPrimitive(p[0], p[1], p[2], buffer, materials)) };
    }
    function createSkin(joints, offset, skeleton, buffer) {
        var size = joints.length * 12 * 4;
        var inverseMatrixhandle = ezasm.poolAlloc(size);
        var buf = ezasm.handleToByteArray(inverseMatrixhandle, size);
        buf.set(new Uint8Array(buffer, offset, size), 0);
        return { joints: joints, inverseMatrixhandle: inverseMatrixhandle, skeleton: skeleton };
    }
    function createNode(name, translation, rotation, scale, matrix, children, mesh, skin, buffer) {
        function readFloats(offset, count) {
            if (offset < 0)
                return null;
            var b = new Float32Array(buffer, offset);
            if (count == 3)
                return [b[0], b[1], b[2]];
            else
                return [b[0], b[1], b[2], b[3]];
        }
        return {
            name: name,
            trs: { translation: readFloats(translation, 3), rotation: readFloats(rotation, 4), scale: readFloats(scale, 3) },
            matrix: null,
            children: children,
            mesh: mesh,
            skin: skin
        };
    }
    function createAnimation(name, timelines, channels, initPos, nodes, buffer) {
        var times = timelines.map(t => {
            return {
                minT: t[2],
                maxT: t[3],
                data: new Float32Array(buffer, t[1], t[0])
            };
        });
        if (!initPos)
            initPos = nodes.map(n => n.trs);
        else {
            for (var i = 0; i < nodes.length; i++) {
                var trs = initPos[i];
                if (!trs)
                    initPos[i] = nodes[i].trs;
                else
                    initPos[i] = { translation: trs[0], rotation: trs[1], scale: trs[2] };
            }
        }
        var ani = new ez.Animation(name, initPos, channels.map(c => {
            var data = c[3];
            var timeline = times[c[2]];
            return {
                nodeId: c[0],
                path: c[1],
                minT: timeline.minT,
                maxT: timeline.maxT,
                input: timeline.data,
                output: new Float32Array(buffer, data[2], data[1] * data[0]),
                valueCount: data[1],
                interpolation: ez.AnimationInterpolation.LINEAR
            };
        }));
        if (ez.Cache3DAnimationFPS)
            ani.setCache();
        return ani;
    }
    function utf8Decode(bytes) {
        var str = "";
        var j = 0;
        var cnt = bytes.length;
        while (j < cnt) {
            var b1 = bytes[j++] & 0xFF;
            if (b1 <= 0x7F)
                str += String.fromCharCode(b1);
            else {
                var pf = 0xC0;
                var bits = 5;
                do {
                    var mask = (pf >> 1) | 0x80;
                    if ((b1 & mask) === pf)
                        break;
                    pf = (pf >> 1) | 0x80;
                    --bits;
                } while (bits >= 0);
                if (bits <= 0)
                    throw new Error("Invalid UTF8 char");
                var code = (b1 & ((1 << bits) - 1));
                for (var i = 5; i >= bits; --i) {
                    var bi = bytes[j++];
                    if ((bi & 0xC0) != 0x80) {
                        throw new Error("Invalid UTF8 char");
                    }
                    code = (code << 6) | (bi & 0x3F);
                }
                if (code >= 0x10000)
                    str += String.fromCharCode((((code - 0x10000) >> 10) & 0x3FF) | 0xD800, (code & 0x3FF) | 0xDC00);
                else
                    str += String.fromCharCode(code);
            }
        }
        return str;
    }
    function createModel(model) {
        var nodes = [];
        for (let i = 0; i < model.nodes.length; i++) {
            var n = model.nodes[i];
            if (n.matrix)
                nodes[i] = new ez.Node(n.name, null, ez.Mat3x4.fromMat4(n.matrix, true));
            else
                nodes[i] = new ez.Node(n.name, n.trs, null);
            if (typeof n.mesh === "number") {
                nodes[i].mesh = model.meshes[n.mesh];
                if (typeof n.skin === "number") {
                    nodes[i].skin = model.skins[n.skin];
                }
            }
        }
        for (let i = 0; i < model.nodes.length; i++) {
            n = model.nodes[i];
            if (n.children) {
                var node = nodes[i];
                node.children = n.children.map(idx => nodes[idx]);
                node.children.forEach(n => n.parent = node);
            }
        }
        return new ez.Model(nodes, model.root, model.animations);
    }
    function readModelFile(buffer, texPath) {
        var data = new DataView(buffer);
        var sig = data.getInt32(0, true);
        var ver = data.getInt32(4, true);
        var len = data.getInt32(8, true);
        var buff = buffer.slice(12, len + 12);
        var json = JSON.parse(utf8Decode(new Uint8Array(buffer, len + 12, buffer.byteLength - len - 12)));
        var model = {};
        var i;
        var materials = json[1].map(v => {
            var args;
            if (ver == 1)
                args = createMaterialV1.apply(null, v);
            else
                args = createMaterialV2.apply(null, v);
            if (texPath)
                args.texturePath = texPath;
            return ez.ShaderLib.createMaterial(args.shadingModel, args);
        });
        model.root = json[0];
        model.meshes = json[2].map(m => createMesh(m, buff, materials));
        model.skins = json[3].map(s => createSkin(s[0], s[1], s[2], buff));
        model.nodes = json[4].map(n => createNode(n[0], n[1], n[2], n[3], n[4], n[5], n[6], n[7], buff));
        model.animations = json[5].map(a => createAnimation(a[0], a[1], a[2], a[3], model.nodes, buff));
        for (i = 0; i < model.skins.length; i++) {
            let skin = model.skins[i];
            skin.jointNames = skin.joints.map(idx => model.nodes[idx].name);
        }
        for (i = 0; i < model.nodes.length; i++) {
            let n = model.nodes[i];
            if (typeof n.mesh === "number" && typeof n.skin === "number") {
                let mesh = model.meshes[n.mesh];
                let s = model.skins[n.skin];
                let skin = new ez.Skin(s);
                for (let j = 0; j < mesh.primitives.length; j++) {
                    mesh.primitives[j].skin = skin;
                    if (skin.joints.length > ez.MAX_BONE)
                        mesh.primitives[j].splitSkin(ez.MAX_BONE);
                }
            }
        }
        return model;
    }
    var models = {};
    let modelFile;
    (function (modelFile) {
        function load(name, onFinish, onError) {
            return __awaiter(this, void 0, void 0, function* () {
                if (name.substring(0, 4) == "http") {
                    try {
                        let res = ez.getExternalRes(name, 6);
                        yield res.loadAsync();
                        let data = res.getData();
                        let texPath = name.substring(0, name.lastIndexOf('/') + 1);
                        let modelData = readModelFile(data, texPath);
                        onFinish(createModel(modelData));
                    }
                    catch (e) {
                        onError(e);
                    }
                }
                else {
                    if (models[name]) {
                        onFinish(createModel(models[name]));
                        return;
                    }
                    let res = ez.getRes(name);
                    try {
                        yield res.loadAsync();
                        if (models[name]) {
                            onFinish(createModel(models[name]));
                            return;
                        }
                        let data = res.getData();
                        let modelData = readModelFile(data);
                        models[name] = modelData;
                        res.release();
                        onFinish(createModel(modelData));
                    }
                    catch (e) {
                        onError(e);
                    }
                }
            });
        }
        modelFile.load = load;
    })(modelFile = ez.modelFile || (ez.modelFile = {}));
})(ez || (ez = {}));
var ez;
(function (ez) {
    let UniformType;
    (function (UniformType) {
        UniformType[UniformType["Float"] = 0] = "Float";
        UniformType[UniformType["Vec2"] = 1] = "Vec2";
        UniformType[UniformType["Vec3"] = 2] = "Vec3";
        UniformType[UniformType["Vec4"] = 3] = "Vec4";
        UniformType[UniformType["Mat3"] = 4] = "Mat3";
        UniformType[UniformType["Mat4"] = 5] = "Mat4";
    })(UniformType = ez.UniformType || (ez.UniformType = {}));
    var shaderCount = 1;
    let ShaderLib;
    (function (ShaderLib) {
        var shaderDefs = {};
        function registerShader(name, createMaterial, createShader) {
            if (shaderDefs[name])
                throw new Error(`shader ${name} already registered.`);
            shaderDefs[name] = {
                name: name,
                createMaterial: createMaterial,
                create: createShader,
                shaders: {}
            };
        }
        ShaderLib.registerShader = registerShader;
        function createMaterial(name, args) {
            var def = shaderDefs[name];
            if (!def)
                throw new Error(`shader ${name} is not found.`);
            return def.createMaterial(args);
        }
        ShaderLib.createMaterial = createMaterial;
        function getShader(name, flags) {
            var def = shaderDefs[name];
            if (!def)
                throw new Error(`shader ${name} is not found.`);
            if (def.shaders[flags])
                return def.shaders[flags];
            var s = def.create(flags);
            s.sortKey = shaderCount << 24;
            s.name = name + " " + flags;
            def.shaders[flags] = s;
            return s;
        }
        ShaderLib.getShader = getShader;
    })(ShaderLib = ez.ShaderLib || (ez.ShaderLib = {}));
})(ez || (ez = {}));
var ez;
(function (ez) {
    ez.Cache3DAnimationFPS = 0;
    function loadImage(url) {
        return new Promise((r, e) => {
            var img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = url;
            img.onload = function () {
                r(img);
            };
            img.onerror = function (ev) {
                e(ev.message);
            };
        });
    }
    ;
    function loadModelFile(filename) {
        var type;
        if (filename.substring(0, 4) == "http") {
            var ext = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
            if (ext == "model")
                type = 9;
            else if (ext == "gltf")
                type = 8;
            else
                throw new Error(`unknown type of '${filename}'`);
        }
        else {
            var res = ez.getRes(filename);
            type = res.type;
            if (type != 9 && type != 8)
                throw new Error(`the res of '${filename}' is not model type`);
        }
        return new Promise((r, e) => {
            if (type == 9)
                ez.modelFile.load(filename, r, e);
            else if (type == 8)
                gltf.load(filename, r, e);
        });
    }
    ez.loadModelFile = loadModelFile;
    class Stage3DSprite extends ez.Sprite {
        constructor(parent, id) {
            super(parent, id);
            this.renderables = [];
            this.camera = new ez.Camera();
            this._ownerBuffer = false;
            this._ticker = ez.addTicker(this.update, this);
        }
        getType() {
            return ez.SubStageSprite.Type;
        }
        destroyBuffer() {
            if (this._rtBuffer) {
                this._rtBuffer.dispose();
                this._rtBuffer = null;
            }
        }
        _dispose() {
            super._dispose();
            this.destroyBuffer();
            this.clear();
            ez.removeTicker(this._ticker);
        }
        get width() {
            return ezasm.getwidth(this._handle);
        }
        set width(val) {
            if (this.width == val)
                return;
            this.destroyBuffer();
            ezasm.setwidth(this._handle, val);
        }
        get height() {
            return ezasm.getheight(this._handle);
        }
        set height(val) {
            if (this.height == val)
                return;
            this.destroyBuffer();
            ezasm.setheight(this._handle, val);
        }
        get ownerBuffer() {
            return ezasm.getOwnerBuffer(this._handle);
        }
        set ownerBuffer(val) {
            if (val == this.ownerBuffer)
                return;
            ezasm.setOwnerBuffer(this._handle, val);
            this.setDirty();
            if (!val)
                this.destroyBuffer();
        }
        update(dt) {
            var d = false;
            var models = this.renderables;
            for (var i = 0; i < models.length; i++)
                d = models[i].update(dt) || d;
            if (d || this.camera.changed)
                this.setDirty();
            this.camera.changed = false;
        }
        setDirty(needSort = false) {
            if (!this._parent)
                return;
            if (this.visible) {
                this._parent.makeDirty(needSort);
                if (this._ownerBuffer)
                    this._parent.needPreRender(this);
            }
        }
        preRender(profile) {
            if (this._ownerBuffer) {
                if (this.width <= 0 || this.height <= 0)
                    return;
                if (!this._rtBuffer)
                    this._rtBuffer = ez.RenderTexture.create(this.width, this.height, true);
                var rc = ez.RenderContext;
                rc.beginRender(this._rtBuffer, profile);
                var ctx = rc.begin3DRender(null);
                var gl = ez.getGL();
                gl.clear(gl.DEPTH_BUFFER_BIT);
                this.renderPipeline.render(ctx, this.renderables, this.camera);
                rc.endRender();
            }
        }
        _prepare(bound, transfrom, transChanged) {
            var handle = this._handle;
            this._buildTransform();
            if (transChanged || !ezasm.getglobalTrans(handle)) {
                ezasm.buildGlobalTrans(handle, transfrom);
                if (this.width > 0) {
                    var b = ezasm.handleToFloatArray(ezasm.calcBound(handle), 4);
                    this._bound = new ez.Rect(b[0], b[1], b[2] - b[0], b[3] - b[1]);
                }
                else
                    this._bound = null;
            }
        }
        _draw(rc, opacity) {
            opacity *= this.opacity;
            if (opacity < 0.01)
                return;
            if (this._rtBuffer) {
                this.applyEffect(rc);
                rc.setAlphaBlend(opacity, this.blendMode);
                rc.setFillColor("#ffffff");
                ezasm.saveTempStack();
                var m;
                if (useWGL) {
                    m = ezasm.tempStackAlloc(6 * 4);
                    var f = ezasm.handleToFloatArray(m, 6);
                    f[0] = 1;
                    f[3] = -1;
                    f[1] = f[2] = f[4] = 0;
                    f[5] = this.height;
                    ezasm.mat2x3Append(m, ezasm.getglobalTrans(this._handle));
                }
                else
                    m = ezasm.getglobalTrans(this._handle);
                rc.drawImage(this._rtBuffer, m, this.width, this.height);
                ezasm.restoreTempStack();
            }
            else if (!this.ownerBuffer) {
                if (this.renderables.length == 0)
                    return;
                if (this._bound) {
                    if (this._bound.left < 0 || this._bound.top < 0) {
                        Log.error("the stage3d out of bound.");
                        return;
                    }
                }
                var ctx = rc.begin3DRender(this._bound);
                var gl = ez.getGL();
                gl.clear(gl.DEPTH_BUFFER_BIT);
                ezasm.saveTempStack();
                try {
                    this.renderPipeline.render(ctx, this.renderables, this.camera);
                }
                catch (e) {
                    Log.error("render error: ", e);
                }
                ezasm.restoreTempStack();
                ctx.end();
            }
        }
        clear() {
            var objs = this.renderables;
            this.renderables = [];
            for (var i = 0; i < objs.length; i++) {
                objs[i].dispose();
            }
        }
        addChild(obj) {
            obj.scene = this;
            this.renderables.push(obj);
        }
        remove(obj) {
            var idx = this.renderables.indexOf(obj);
            if (idx == -1)
                return;
            this.renderables.splice(idx, 1);
        }
        loadModel(name) {
            return __awaiter(this, void 0, void 0, function* () {
                var m = yield loadModelFile(name);
                this.addChild(m);
                return m;
            });
        }
    }
    Stage3DSprite.Type = "Stage3D";
    ez.Stage3DSprite = Stage3DSprite;
    ez.Sprite.register(Stage3DSprite.Type, (p, id) => new Stage3DSprite(p, id));
    let ui;
    (function (ui) {
        class Stage3D extends ui.Visual {
            constructor(parent) {
                super(parent, new Stage3DSprite(parent._displayStage));
                this._stage = this._sprite;
                this.bind("ownerBuffer", this._sprite);
            }
            get stage() {
                return this._stage;
            }
        }
        Stage3D.ClassName = "Stage3D";
        Stage3D.Properties = [
            { name: "ownerBuffer", default: false, type: "boolean", converter: ez.parse.Boolean }
        ];
        ui.Stage3D = Stage3D;
        ui.initUIClass(Stage3D, ui.Visual);
    })(ui = ez.ui || (ez.ui = {}));
})(ez || (ez = {}));

//# sourceMappingURL=ez.3d.js.map
