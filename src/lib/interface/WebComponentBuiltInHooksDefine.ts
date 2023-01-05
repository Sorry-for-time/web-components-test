/**
 * 原生 web 组件内部生命周期函数定义
 */
export interface WebComponentBuiltInHooksDefine {
  /**
   * 组件挂载到真实页面上时触发的回调
   */
  connectedCallback?(): void;

  /**
   * 组件从真实页面上卸载时触发的回调
   */
  disconnectedCallback?(): void;

  /**
   * 组件的属性被更改时触发的回调, 这个方法需要配合具体实现类的的 static get observedAttributes(): Array<string> 方法
   * @param name 属性名称
   * @param _oldValue 旧值
   * @param newValue 新值
   */
  attributeChangedCallback?(name?: string, _oldValue?: string, newValue?: string): void;
}
