import { FileUpload, GraphQLUpload } from "graphql-upload";
import { Arg, Mutation, Resolver } from "type-graphql";
import { createWriteStream } from "fs";

@Resolver()
export class FeatureImageResolver {
  @Mutation(() => Boolean)
  async featureImage(
    @Arg("picture", () => GraphQLUpload)
    picture: FileUpload
  ): Promise<boolean> {
    const { createReadStream, filename } = await picture;
    const writableStream = createWriteStream(
      __dirname + `/../../images/${filename}`
    );
    return new Promise(async (resolve, reject) => {
      createReadStream()
        .pipe(writableStream)
        .on("finish", () => resolve(true))
        .on("error", () => reject(false));
    });
  }
}

//'{"query":"mutation FeatureImage($picture: Upload!) {\n  featureImage(picture: $picture)\n}"}'
