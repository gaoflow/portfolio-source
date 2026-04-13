import { visit } from 'unist-util-visit';

// Turns markdown's `![alt](src)` + italic caption conventions into real
// <figure>/<figcaption> markup so captions pick up the designed figcaption
// styles instead of rendering as body text glued to the image.
//
// Variant A (same paragraph):
//   ![alt](src)
//   *caption*
//   renders as <p><img><em>...</em></p>
//
// Variant B (blank line between):
//   ![alt](src)
//
//   *caption*
//   renders as <p><img></p><p><em>...</em></p>

const isWhitespace = (node) => node.type === 'text' && node.value.trim() === '';
const meaningful = (node) => node.children.filter((child) => !isWhitespace(child));
const isElement = (node, tag) => node?.type === 'element' && node.tagName === tag;

const makeFigure = (img, em) => ({
  type: 'element',
  tagName: 'figure',
  properties: {},
  children: [
    img,
    { type: 'element', tagName: 'figcaption', properties: {}, children: em.children },
  ],
});

const isImageOnlyPara = (node) => {
  if (!isElement(node, 'p')) return false;
  const items = meaningful(node);
  return items.length === 1 && isElement(items[0], 'img');
};

const isCaptionOnlyPara = (node) => {
  if (!isElement(node, 'p')) return false;
  const items = meaningful(node);
  return items.length === 1 && isElement(items[0], 'em');
};

export default function rehypeFigureCaptions() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (!isElement(node, 'p') || !parent || index == null) return;
      const items = meaningful(node);

      if (
        items.length === 2 &&
        isElement(items[0], 'img') &&
        isElement(items[1], 'em')
      ) {
        parent.children[index] = makeFigure(items[0], items[1]);
        return;
      }

      if (isCaptionOnlyPara(node)) {
        // hast keeps inter-element newlines as text nodes; walk past them
        let prevIndex = index - 1;
        while (prevIndex >= 0 && isWhitespace(parent.children[prevIndex])) prevIndex -= 1;
        const prev = parent.children[prevIndex];
        if (isImageOnlyPara(prev)) {
          const img = meaningful(prev)[0];
          parent.children.splice(prevIndex, index - prevIndex + 1, makeFigure(img, meaningful(node)[0]));
          return prevIndex;
        }
      }
    });
  };
}
