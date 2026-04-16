export type EntityDocumentMapper<TDocument, TEntity> = (
  document: TDocument,
) => TEntity;

export function mapDocument<TDocument, TEntity>(
  document: TDocument | null,
  mapper: EntityDocumentMapper<TDocument, TEntity>,
): TEntity | null {
  return document ? mapper(document) : null;
}

export function mapDocuments<TDocument, TEntity>(
  documents: TDocument[],
  mapper: EntityDocumentMapper<TDocument, TEntity>,
): TEntity[] {
  return documents.map((document) => mapper(document));
}
