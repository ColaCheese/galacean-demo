import {
    Entity,
    Vector3,
    TextRenderer,
    Color,
    Font,
    FontStyle
} from "@galacean/engine";


export default function createText(
    rootEntity: Entity,
    text: string,
    pos: Vector3 = new Vector3(0, 0.25, 0),
    color: Color = new Color(0, 0, 0, 1),
    fontFamily: string = "Arial",
    fontSize: number = 26,
    bold: boolean = false,
    italic: boolean = false
): Entity {
    const textEntity = rootEntity.createChild("text");
    textEntity.transform.position = pos;

    const renderer = textEntity.addComponent(TextRenderer);
    renderer.color = color;
    renderer.text = text;
    renderer.font = Font.createFromOS(textEntity.engine, fontFamily);
    renderer.fontSize = fontSize;
    bold && (renderer.fontStyle |= FontStyle.Bold);
    italic && (renderer.fontStyle |= FontStyle.Italic);

    return textEntity;
};